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
let isInitializing = false;
let qrGeneratedTime = null;

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
  isInitializing = false;
  currentQRCodeDataURL = null;
  qrGeneratedTime = null;
  if (qrTimeout) {
    clearTimeout(qrTimeout);
    qrTimeout = null;
  }
}

// Function to check if QR code is still valid (within 5 minutes)
function isQRCodeValid() {
  if (!currentQRCodeDataURL || !qrGeneratedTime) {
    return false;
  }
  const now = new Date();
  const timeDiff = now - qrGeneratedTime;
  const fiveMinutes = 5 * 60 * 1000; // 5 minutes in milliseconds
  return timeDiff < fiveMinutes;
}

// Function to get remaining QR time in seconds
function getQRRemainingTime() {
  if (!qrGeneratedTime) return 0;
  const now = new Date();
  const timeDiff = now - qrGeneratedTime;
  const fiveMinutes = 5 * 60 * 1000;
  const remaining = Math.max(0, Math.floor((fiveMinutes - timeDiff) / 1000));
  return remaining;
}

// Non-blocking function to initialize the client
function initializeClientAsync() {
  if (isInitializing) {
    console.log("Client is already initializing...");
    return;
  }

  // Check if client is already authenticated
  if (client && client.info && client.info.wid) {
    console.log("Client is already authenticated");
    return;
  }

  isInitializing = true;
  console.log("Starting async client initialization...");

  // Create client initialization promise but don't await it
  const initPromise = (async () => {
    try {
      // Destroy any existing client
      if (client) {
        await client.destroy();
        client = null;
      }

      console.log("Creating new WhatsApp client...");
      clientInitialized = false;

      // Initialize WhatsApp client
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
            '--disable-extensions',
            '--disable-web-security'
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
          
          qrGeneratedTime = new Date();
          console.log("QR code generated successfully at:", qrGeneratedTime.toISOString());

          // Clear any existing timeout
          if (qrTimeout) {
            clearTimeout(qrTimeout);
          }

          // Set QR code expiration to 5 minutes
          qrTimeout = setTimeout(() => {
            console.log("QR code expired after 5 minutes");
            currentQRCodeDataURL = null;
            qrGeneratedTime = null;
            qrTimeout = null;
          }, 300000); // 5 minutes

        } catch (err) {
          console.error("Error generating QR code:", err);
          currentQRCodeDataURL = null;
          qrGeneratedTime = null;
        }
      });

      // Handle successful authentication
      client.on("authenticated", () => {
        console.log("Authenticated successfully!");
        currentQRCodeDataURL = null;
        qrGeneratedTime = null;
        if (qrTimeout) {
          clearTimeout(qrTimeout);
          qrTimeout = null;
        }
        clientInitialized = true;
        isInitializing = false;
      });

      // Handle client ready state
      client.on("ready", () => {
        console.log("WhatsApp client is ready!");
        currentQRCodeDataURL = null;
        qrGeneratedTime = null;
        if (qrTimeout) {
          clearTimeout(qrTimeout);
          qrTimeout = null;
        }
        clientInitialized = true;
        isInitializing = false;
      });

      // Handle authentication failure
      client.on("auth_failure", (msg) => {
        console.error("Authentication failure:", msg);
        clientInitialized = false;
        isInitializing = false;
        currentQRCodeDataURL = null;
        qrGeneratedTime = null;
        if (qrTimeout) {
          clearTimeout(qrTimeout);
          qrTimeout = null;
        }
      });

      // Handle disconnection
      client.on("disconnected", (reason) => {
        console.log("Client disconnected:", reason);
        clientInitialized = false;
        isInitializing = false;
        currentQRCodeDataURL = null;
        qrGeneratedTime = null;
        if (qrTimeout) {
          clearTimeout(qrTimeout);
          qrTimeout = null;
        }
        client = null;
      });

      // Handle loading screen
      client.on("loading_screen", (percent, message) => {
        console.log("Loading progress:", percent, "%", message);
      });

      // Initialize the client
      console.log("Initializing client...");
      await client.initialize();

    } catch (error) {
      console.error("Error in client initialization:", error);
      clientInitialized = false;
      isInitializing = false;
      currentQRCodeDataURL = null;
      qrGeneratedTime = null;
      if (client) {
        try {
          await client.destroy();
        } catch (destroyError) {
          console.error("Error destroying client on init failure:", destroyError);
        }
        client = null;
      }
    }
  })();

  // Don't await the promise, let it run in background
  initPromise.catch(error => {
    console.error("Background initialization failed:", error);
    isInitializing = false;
  });
}

// Endpoint to check session status - NON-BLOCKING (fixed naming to match your route)
exports.checkSession = async (req, res) => {
  // Add CORS headers
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  
  // Handle preflight OPTIONS request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
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
    if (currentQRCodeDataURL && isQRCodeValid()) {
      console.log("Returning existing valid QR code");
      const remainingTime = getQRRemainingTime();
      return res.json({
        status: "qr_ready",
        message: `QR code available. Expires in ${Math.floor(remainingTime / 60)}:${(remainingTime % 60).toString().padStart(2, '0')}`,
        authenticated: false,
        qrCode: currentQRCodeDataURL,
        expiresInSeconds: remainingTime
      });
    }

    // Check if client is currently initializing
    if (isInitializing) {
      console.log("Client is initializing, please wait...");
      return res.json({
        status: "initializing",
        message: "WhatsApp client is initializing. Please wait and check again in a few seconds.",
        authenticated: false,
        qrCode: null
      });
    }

    // Start initialization in background
    console.log("Starting client initialization...");
    initializeClientAsync();

    // Return immediately
    return res.json({
      status: "initializing",
      message: "WhatsApp client initialization started. Please wait and check again in a few seconds.",
      authenticated: false,
      qrCode: null
    });

  } catch (error) {
    console.error("Error in checkSession:", error);
    
    return res.status(500).json({
      status: "error",
      message: "Failed to check WhatsApp session",
      error: error.message,
      authenticated: false
    });
  }
};

// New endpoint to wait for QR code with timeout
exports.waitForQR = async (req, res) => {
  const timeout = parseInt(req.query.timeout) || 30; // Default 30 seconds timeout
  const startTime = Date.now();
  
  console.log(`Waiting for QR code with ${timeout}s timeout...`);

  // Check immediately
  if (client && client.info && client.info.wid) {
    return res.json({
      status: "success",
      message: "Already authenticated",
      authenticated: true
    });
  }

  if (currentQRCodeDataURL && isQRCodeValid()) {
    return res.json({
      status: "qr_ready",
      message: "QR code is ready",
      authenticated: false,
      qrCode: currentQRCodeDataURL,
      expiresInSeconds: getQRRemainingTime()
    });
  }

  // Start initialization if not already running
  if (!isInitializing) {
    initializeClientAsync();
  }

  // Poll for QR code
  const pollInterval = setInterval(() => {
    const elapsed = (Date.now() - startTime) / 1000;
    
    if (elapsed > timeout) {
      clearInterval(pollInterval);
      return res.json({
        status: "timeout",
        message: `Timeout waiting for QR code after ${timeout} seconds`,
        authenticated: false
      });
    }

    if (client && client.info && client.info.wid) {
      clearInterval(pollInterval);
      return res.json({
        status: "success",
        message: "Authenticated during wait",
        authenticated: true
      });
    }

    if (currentQRCodeDataURL && isQRCodeValid()) {
      clearInterval(pollInterval);
      return res.json({
        status: "qr_ready",
        message: "QR code is ready",
        authenticated: false,
        qrCode: currentQRCodeDataURL,
        expiresInSeconds: getQRRemainingTime()
      });
    }
  }, 1000); // Check every second
};

// Controller function to send WhatsApp message
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

// Logout endpoint (Windows-safe)
exports.logoutWhatsApp = async (req, res) => {
  try {
    console.log("Logging out WhatsApp client...");

    if (client && client.info && client.info.wid) {
      try {
        // Logout from WhatsApp
        await client.logout();
        console.log("Client logged out successfully");
        await delay(3000); // Longer delay for Windows
      } catch (logoutError) {
        console.log("Logout error (continuing with cleanup):", logoutError.message);
      }
    }

    // Destroy client and wait for cleanup
    await destroyClient();
    
    // Additional delay before clearing session files
    await delay(2000);
    
    // Clear session files (Windows-safe)
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
      await delay(2000);
      clearSession();
    } catch (cleanupError) {
      console.error("Error during force cleanup:", cleanupError);
    }

    res.json({
      status: "success", 
      message: "Logout completed (session may need manual cleanup)"
    });
  }
};

// Get user profile endpoint
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

// Get current QR status
exports.getCurrentQR = async (req, res) => {
  try {
    if (client && client.info && client.info.wid) {
      return res.json({
        status: "authenticated",
        message: "Already authenticated",
        authenticated: true
      });
    }

    if (isInitializing) {
      return res.json({
        status: "initializing",
        message: "Client is initializing...",
        authenticated: false
      });
    }

    if (currentQRCodeDataURL && isQRCodeValid()) {
      return res.json({
        status: "qr_available",
        message: "QR code is available",
        qrCode: currentQRCodeDataURL,
        expiresInSeconds: getQRRemainingTime(),
        authenticated: false
      });
    }

    return res.json({
      status: "no_qr",
      message: "No QR code available. Call /check-session to generate one.",
      authenticated: false
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
        clientReady: clientReady,  // Add ready status
        isInitializing: isInitializing,
        hasQRCode: !!currentQRCodeDataURL,
        qrCodeValid: isQRCodeValid(),
        isAuthenticated: !!(client && client.info && client.info.wid),
        qrRemainingTime: getQRRemainingTime()
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

// Force reinitialize endpoint (for debugging)
exports.forceReinitialize = async (req, res) => {
  try {
    console.log("Force reinitializing WhatsApp client...");
    
    // Destroy current client
    await destroyClient();
    
    // Clear session if requested
    if (req.query.clearSession === 'true') {
      clearSession();
    }
    
    // Start new initialization
    initializeClientAsync();
    
    res.json({
      status: "success",
      message: "Reinitialization started. Check status in a few seconds."
    });
    
  } catch (error) {
    console.error("Error in force reinitialize:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to reinitialize",
      error: error.message
    });
  }
};