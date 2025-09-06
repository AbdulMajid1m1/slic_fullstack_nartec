const { Client, MessageMedia, LocalAuth } = require("whatsapp-web.js");
const express = require("express");
const fs = require("fs");
const path = require("path");
const QRCode = require("qrcode");
const { check, validationResult } = require("express-validator");

// Variables to store the client and QR code data
let client = null;
let clientInitialized = false;
let currentQRCodeDataURL = null;
let qrTimeout = null;
let initializationPromise = null;

// Helper function to add delay
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Function to clear session data
function clearSession() {
  const sessionPath = path.join(__dirname, "../.wwebjs_auth");
  try {
    if (fs.existsSync(sessionPath)) {
      fs.rmSync(sessionPath, { recursive: true, force: true });
      console.log("Session data cleared");
    }
  } catch (error) {
    console.error("Error clearing session:", error);
  }
}

// Function to destroy existing client
async function destroyClient() {
  if (client) {
    try {
      await client.destroy();
      console.log("Previous client destroyed");
    } catch (error) {
      console.error("Error destroying client:", error);
    }
    client = null;
  }
  clientInitialized = false;
  currentQRCodeDataURL = null;
  if (qrTimeout) {
    clearTimeout(qrTimeout);
    qrTimeout = null;
  }
  initializationPromise = null;
}

// Function to initialize the client and wait for QR code
function initializeClient() {
  // If already initializing, return the existing promise
  if (initializationPromise) {
    return initializationPromise;
  }

  initializationPromise = new Promise(async (resolve, reject) => {
    try {
      // Check if client is already authenticated
      if (client && client.info && client.info.wid) {
        resolve({ status: "authenticated", data: null });
        return;
      }

      // Destroy any existing client
      await destroyClient();

      console.log("Initializing new WhatsApp client...");
      clientInitialized = true;

      // Initialize WhatsApp client with session persistence
      client = new Client({
        authStrategy: new LocalAuth({
          clientId: "client-one",
          dataPath: path.join(__dirname, "../.wwebjs_auth"),
        }),
        puppeteer: {
          headless: true,
          args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-accelerated-2d-canvas',
            '--no-first-run',
            '--no-zygote',
            '--disable-gpu',
            '--disable-extensions'
          ]
        },
        qrMaxRetries: 3
      });

      // Handle QR code generation
      client.on("qr", async (qr) => {
        try {
          console.log("QR code received, generating data URL...");
          currentQRCodeDataURL = await QRCode.toDataURL(qr, {
            errorCorrectionLevel: 'M',
            type: 'image/png',
            quality: 0.92,
            margin: 1,
            color: {
              dark: '#000000',
              light: '#FFFFFF'
            }
          });
          
          console.log("QR code generated successfully");

          // Clear any existing timeout
          if (qrTimeout) {
            clearTimeout(qrTimeout);
          }

          // Set QR code expiration to 5 minutes (300,000 ms)
          qrTimeout = setTimeout(() => {
            console.log("QR code expired after 5 minutes");
            currentQRCodeDataURL = null;
            qrTimeout = null;
          }, 300000); // 5 minutes

          resolve({ 
            status: "qr_ready", 
            data: currentQRCodeDataURL 
          });
        } catch (err) {
          console.error("Error generating QR code:", err);
          reject(new Error(`QR code generation failed: ${err.message}`));
        }
      });

      // Handle successful authentication
      client.on("authenticated", () => {
        console.log("Authenticated successfully!");
        currentQRCodeDataURL = null;
        if (qrTimeout) {
          clearTimeout(qrTimeout);
          qrTimeout = null;
        }
      });

      // Handle client ready state
      client.on("ready", () => {
        console.log("WhatsApp client is ready!");
        currentQRCodeDataURL = null;
        if (qrTimeout) {
          clearTimeout(qrTimeout);
          qrTimeout = null;
        }
      });

      // Handle authentication failure
      client.on("auth_failure", (msg) => {
        console.error("Authentication failure:", msg);
        clientInitialized = false;
        currentQRCodeDataURL = null;
        if (qrTimeout) {
          clearTimeout(qrTimeout);
          qrTimeout = null;
        }
        initializationPromise = null;
        reject(new Error(`Authentication failed: ${msg}`));
      });

      // Handle disconnection
      client.on("disconnected", (reason) => {
        console.log("Client disconnected:", reason);
        clientInitialized = false;
        currentQRCodeDataURL = null;
        if (qrTimeout) {
          clearTimeout(qrTimeout);
          qrTimeout = null;
        }
        client = null;
        initializationPromise = null;
      });

      // Handle connection state changes
      client.on("change_state", (state) => {
        console.log("Connection state changed:", state);
      });

      // Handle loading screen
      client.on("loading_screen", (percent, message) => {
        console.log("Loading progress:", percent, message);
      });

      // Initialize the client
      await client.initialize();

      // Set overall initialization timeout (2 minutes)
      setTimeout(() => {
        if (!client || !client.info) {
          reject(new Error("Client initialization timeout after 2 minutes"));
        }
      }, 120000);

    } catch (error) {
      console.error("Error in initializeClient:", error);
      clientInitialized = false;
      currentQRCodeDataURL = null;
      initializationPromise = null;
      reject(error);
    }
  });

  return initializationPromise;
}

// Endpoint to check session status and return QR code if not authenticated
exports.checkSession = async (req, res) => {
  try {
    console.log("Checking session status...");

    // Check if client exists and is authenticated
    if (client && client.info && client.info.wid) {
      console.log("Active session found");
      return res.json({
        status: "success",
        message: "Session is active",
        authenticated: true,
        user: {
          name: client.info.pushname || "Unknown",
          number: client.info.me.user,
          id: client.info.wid._serialized
        }
      });
    }

    // Check if we have a valid QR code
    if (currentQRCodeDataURL) {
      console.log("Returning existing QR code");
      return res.json({
        status: "qr_ready",
        message: "QR code available. Please scan within 5 minutes.",
        authenticated: false,
        qrCode: currentQRCodeDataURL,
        expiresIn: "5 minutes"
      });
    }

    // Initialize client and get QR code
    console.log("Initializing client for QR code...");
    const result = await initializeClient();

    if (result.status === "authenticated") {
      return res.json({
        status: "success",
        message: "Session is active",
        authenticated: true
      });
    }

    if (result.status === "qr_ready") {
      return res.json({
        status: "qr_ready",
        message: "QR code generated. Please scan within 5 minutes.",
        authenticated: false,
        qrCode: result.data,
        expiresIn: "5 minutes"
      });
    }

  } catch (error) {
    console.error("Error in checkSession:", error);
    
    // Reset state on error
    await destroyClient();

    return res.status(500).json({
      status: "error",
      message: "Failed to initialize WhatsApp session",
      error: error.message,
      authenticated: false
    });
  }
};

// Controller function to send WhatsApp message with attachment and text
exports.sendWhatsAppMessage = [
  [
    check("phoneNumber")
      .isMobilePhone()
      .withMessage("Please enter a valid phone number"),
    check("messageText")
      .isLength({ min: 1 })
      .withMessage("Message text cannot be empty"),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        status: "error",
        errors: errors.array() 
      });
    }

    const { phoneNumber, messageText } = req.body;
    const attachmentPath = req.file ? req.file.path : null;

    try {
      // Check if client is ready
      if (!client || !client.info || !client.info.wid) {
        return res.status(400).json({
          status: "error",
          message: "WhatsApp client is not connected. Please scan QR code first."
        });
      }

      // Format phone number
      const formattedPhoneNumber = `${phoneNumber.replace(/\D/g, "")}@c.us`;
      console.log(`Sending message to: ${formattedPhoneNumber}`);

      let messagesSent = [];

      // Send message with media (if any)
      if (attachmentPath && fs.existsSync(attachmentPath)) {
        try {
          console.log("Sending media message...");
          const media = MessageMedia.fromFilePath(attachmentPath);
          await client.sendMessage(formattedPhoneNumber, media, {
            caption: messageText,
          });
          messagesSent.push("Media message with caption");
          console.log("✅ Media message sent successfully");
        } catch (err) {
          console.error("❌ Failed to send media message:", err);
          throw err;
        } finally {
          // Always cleanup the uploaded file
          try {
            fs.unlinkSync(attachmentPath);
            console.log("Uploaded file cleaned up");
          } catch (cleanupErr) {
            console.error("Error cleaning up file:", cleanupErr);
          }
        }
      } else {
        try {
          console.log("Sending text message...");
          await client.sendMessage(formattedPhoneNumber, messageText);
          messagesSent.push("Text message");
          console.log("✅ Text message sent successfully");
        } catch (err) {
          console.error("❌ Failed to send text message:", err);
          throw err;
        }
      }

      // Add delay between messages
      await delay(2000);

      // Send feedback link
      const ratingLink = "https://docs.google.com/forms/d/e/1FAIpQLSceYlSsIGZ9j6YjB0pFBnn7xcWBSRP7UOmYalyPPrWstvVvQA/viewform";
      const ratingMessage = `We value your feedback! Please take a moment to rate your purchase order: ${ratingLink}`;

      try {
        console.log("Sending feedback message...");
        await client.sendMessage(formattedPhoneNumber, ratingMessage);
        messagesSent.push("Feedback message");
        console.log("✅ Feedback message sent successfully");
      } catch (err) {
        console.error("❌ Failed to send feedback message:", err);
        // Don't throw error for feedback message failure
      }

      res.json({
        status: "success",
        message: "WhatsApp messages sent successfully",
        messagesSent: messagesSent,
        recipient: formattedPhoneNumber
      });

    } catch (error) {
      console.error("❌ General error in sendWhatsAppMessage:", error);
      
      // Clean up file if it exists
      if (attachmentPath && fs.existsSync(attachmentPath)) {
        try {
          fs.unlinkSync(attachmentPath);
        } catch (cleanupErr) {
          console.error("Error cleaning up file on error:", cleanupErr);
        }
      }

      res.status(500).json({
        status: "error",
        message: "Failed to send WhatsApp message",
        error: error.message
      });
    }
  },
];

// Logout endpoint
exports.logoutWhatsApp = async (req, res) => {
  try {
    console.log("Logging out WhatsApp client...");

    if (client && client.info && client.info.wid) {
      // Logout from WhatsApp
      await client.logout();
      console.log("Client logged out successfully");

      // Wait a bit for logout to complete
      await delay(2000);
    }

    // Destroy client and clear session
    await destroyClient();
    
    // Clear session files
    clearSession();

    res.json({
      status: "success",
      message: "Logged out successfully and session data cleared"
    });

  } catch (error) {
    console.error("Error during logout:", error);
    
    // Force cleanup even if logout fails
    try {
      await destroyClient();
      clearSession();
    } catch (cleanupError) {
      console.error("Error during force cleanup:", cleanupError);
    }

    res.status(500).json({
      status: "error",
      message: "Logout completed with errors",
      error: error.message
    });
  }
};

// Endpoint to fetch the current connected user's profile
exports.getUserProfile = async (req, res) => {
  try {
    if (!client || !client.info || !client.info.wid) {
      return res.status(400).json({
        status: "error",
        message: "WhatsApp client is not connected"
      });
    }

    console.log("Fetching user profile...");
    
    const userId = client.info.wid._serialized;
    const userName = client.info.pushname || "Unknown";
    const userNumber = client.info.me.user;

    let profilePicUrl = null;
    try {
      profilePicUrl = await client.getProfilePicUrl(userId);
    } catch (picError) {
      console.log("Could not fetch profile picture:", picError.message);
      // Don't fail the entire request if profile pic fails
    }

    res.json({
      status: "success",
      data: {
        name: userName,
        number: userNumber,
        id: userId,
        profilePicUrl: profilePicUrl
      }
    });

  } catch (error) {
    console.error("Error fetching user profile:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to fetch user profile",
      error: error.message
    });
  }
};

// Endpoint to get current QR code without reinitializing
exports.getCurrentQR = async (req, res) => {
  try {
    if (client && client.info && client.info.wid) {
      return res.json({
        status: "authenticated",
        message: "Already authenticated"
      });
    }

    if (currentQRCodeDataURL) {
      return res.json({
        status: "qr_available",
        message: "QR code is available",
        qrCode: currentQRCodeDataURL,
        expiresIn: "5 minutes"
      });
    }

    return res.json({
      status: "no_qr",
      message: "No QR code available. Call /check-session to generate one."
    });

  } catch (error) {
    console.error("Error getting current QR:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to get QR code status",
      error: error.message
    });
  }
};

// Health check endpoint
exports.healthCheck = async (req, res) => {
  try {
    const status = {
      server: "running",
      whatsapp: {
        clientInitialized: clientInitialized,
        hasQRCode: !!currentQRCodeDataURL,
        isAuthenticated: !!(client && client.info && client.info.wid)
      },
      timestamp: new Date().toISOString()
    };

    if (client && client.info && client.info.wid) {
      status.whatsapp.user = {
        name: client.info.pushname || "Unknown",
        number: client.info.me.user
      };
    }

    res.json({
      status: "success",
      data: status
    });

  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Health check failed",
      error: error.message
    });
  }
};