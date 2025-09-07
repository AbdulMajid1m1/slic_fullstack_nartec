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
let isClientReady = false;

// Function to forcefully remove directories with multiple fallback methods
function forceRemoveDirectory(dirPath) {
  if (!fs.existsSync(dirPath)) {
    return true;
  }

  try {
    // Method 1: Standard recursive removal
    fs.rmSync(dirPath, { recursive: true, force: true });
    console.log(`Successfully removed directory: ${dirPath}`);
    return true;
  } catch (error) {
    console.warn(`Method 1 failed for ${dirPath}:`, error.message);
    
    try {
      // Method 2: Manual recursive removal
      const files = fs.readdirSync(dirPath);
      for (const file of files) {
        const fullPath = path.join(dirPath, file);
        const stat = fs.lstatSync(fullPath);
        
        if (stat.isDirectory()) {
          forceRemoveDirectory(fullPath);
        } else {
          try {
            fs.unlinkSync(fullPath);
          } catch (fileError) {
            // Try to change permissions and delete again
            try {
              fs.chmodSync(fullPath, 0o777);
              fs.unlinkSync(fullPath);
            } catch (permError) {
              console.warn(`Could not remove file: ${fullPath}`, permError.message);
            }
          }
        }
      }
      fs.rmdirSync(dirPath);
      console.log(`Successfully removed directory using method 2: ${dirPath}`);
      return true;
    } catch (error2) {
      console.error(`All methods failed to remove ${dirPath}:`, error2.message);
      return false;
    }
  }
}

// Function to clean up all WhatsApp related data
function cleanupWhatsAppData() {
  const authPath = path.join(__dirname, "../.wwebjs_auth");
  const cachePath = path.join(__dirname, "../.wwebjs_cache");
  
  console.log("Cleaning up WhatsApp data...");
  
  // Remove auth directory
  if (fs.existsSync(authPath)) {
    forceRemoveDirectory(authPath);
  }
  
  // Remove cache directory
  if (fs.existsSync(cachePath)) {
    forceRemoveDirectory(cachePath);
  }
}

// Function to destroy existing client
function destroyClient() {
  if (client) {
    try {
      client.removeAllListeners();
      client.destroy();
    } catch (error) {
      console.warn("Error destroying client:", error.message);
    }
  }
  client = null;
  clientInitialized = false;
  isClientReady = false;
  currentQRCodeDataURL = null;
}

// Function to initialize the client and wait for QR code
function initializeClient(forceNew = false) {
  return new Promise((resolve, reject) => {
    // If forcing new client, clean up everything first
    if (forceNew) {
      destroyClient();
      cleanupWhatsAppData();
    }

    if (clientInitialized && !forceNew) {
      // If client is already initializing, wait for QR code or ready state
      const checkInterval = setInterval(() => {
        if (isClientReady) {
          clearInterval(checkInterval);
          resolve({ status: 'ready' });
        } else if (currentQRCodeDataURL) {
          clearInterval(checkInterval);
          resolve({ status: 'qr', qrCode: currentQRCodeDataURL });
        }
      }, 1000);
      
      // Timeout after 30 seconds
      setTimeout(() => {
        clearInterval(checkInterval);
        reject(new Error("Client initialization timeout"));
      }, 30000);
      return;
    }

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
          '--disable-gpu'
        ]
      },
      qrMaxRetries: 0, // Prevent continuous QR code generation
    });

    // Generate QR code when 'qr' event is emitted
    client.on("qr", async (qr) => {
      try {
        currentQRCodeDataURL = await QRCode.toDataURL(qr);
        console.log("QR code received, scan with your phone");
        resolve({ status: 'qr', qrCode: currentQRCodeDataURL });
      } catch (err) {
        console.error("Error generating QR code:", err);
        reject(err);
      }
    });

    // Log when the client is ready to use
    client.on("ready", () => {
      console.log("WhatsApp client is ready!");
      isClientReady = true;
      currentQRCodeDataURL = null; // Clear QR code data
      
      // If we were waiting for ready state, resolve here
      if (!currentQRCodeDataURL) {
        resolve({ status: 'ready' });
      }
    });

    // Log any authentication-related issues
    client.on("authenticated", () => {
      console.log("Authenticated successfully!");
    });

    // Handle authentication failure
    client.on("auth_failure", (msg) => {
      console.error("Authentication failure:", msg);
      destroyClient();
      reject(new Error("Authentication failure"));
    });

    // Handle disconnection events
    client.on("disconnected", (reason) => {
      console.log("WhatsApp client disconnected:", reason);
      isClientReady = false;
      
      // Auto-reconnect logic
      setTimeout(() => {
        console.log("Attempting to reconnect...");
        initializeClient(false).catch(err => {
          console.error("Reconnection failed:", err);
        });
      }, 5000);
    });

    // Handle loading screen
    client.on("loading_screen", (percent, message) => {
      console.log("Loading screen:", percent, message);
    });

    // Initialize the client
    try {
      client.initialize();
    } catch (error) {
      console.error("Error initializing client:", error);
      destroyClient();
      reject(error);
    }
  });
}

// Auto-initialize client on server start
setTimeout(() => {
  initializeClient(false).catch(err => {
    console.error("Auto-initialization failed:", err);
  });
}, 2000);

// Endpoint to check session status and return QR code if not authenticated
exports.checkSession = async (req, res) => {
  try {
    if (client && client.info && client.info.wid && isClientReady) {
      // Session is active
      res.json({ status: "success", message: "Session is active" });
    } else {
      // Check if we need to force new QR (query parameter)
      const forceNew = req.query.forceNew === 'true';
      
      try {
        // Initialize the client and wait for the result
        const result = await initializeClient(forceNew);
        
        if (result.status === 'ready') {
          res.json({ status: "success", message: "Session is active" });
        } else {
          res.json({
            status: "failure",
            message: "No active session. Please scan the QR code.",
            qrCode: result.qrCode,
          });
        }
      } catch (err) {
        console.error("Error during client initialization:", err);
        res.status(500).json({ error: "Failed to initialize WhatsApp client" });
      }
    }
  } catch (error) {
    console.error("Error in checkSession:", error);
    res.status(500).json({ error: "Internal server error" });
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
      return res.status(400).json({ errors: errors.array() });
    }

    const { phoneNumber, messageText } = req.body;
    const attachmentPath = req.file ? req.file.path : null;

    try {
      if (!client || !client.info || !client.info.wid || !isClientReady) {
        return res
          .status(400)
          .json({ error: "WhatsApp client is not connected" });
      }

      const formattedPhoneNumber = `${phoneNumber.replace(/\D/g, "")}@c.us`;

      // Send the first message with the PDF attachment
      if (attachmentPath) {
        const media = MessageMedia.fromFilePath(attachmentPath);
        await client.sendMessage(formattedPhoneNumber, media, {
          caption: messageText,
        });
        
        // Clean up file with error handling
        try {
          fs.unlinkSync(attachmentPath);
        } catch (fileError) {
          console.warn("Could not remove uploaded file:", fileError.message);
        }
      } else {
        await client.sendMessage(formattedPhoneNumber, messageText);
      }

      // Hardcoded link for feedback
      const ratingLink =
        "https://docs.google.com/forms/d/e/1FAIpQLSceYlSsIGZ9j6YjB0pFBnn7xcWBSRP7UOmYalyPPrWstvVvQA/viewform";
      const ratingMessage = `We value your feedback! Please take a moment to rate your purchase order: ${ratingLink}`;
      
      // Send the second message with the hardcoded link
      await client.sendMessage(formattedPhoneNumber, ratingMessage);

      res.json({ message: "WhatsApp messages sent successfully!" });
    } catch (error) {
      console.error("Error sending WhatsApp message:", error);
      res.status(500).json({ error: "Failed to send messages" });
      
      // Clean up file if error occurred
      if (attachmentPath) {
        try {
          fs.unlinkSync(attachmentPath);
        } catch (fileError) {
          console.warn("Could not remove uploaded file after error:", fileError.message);
        }
      }
    }
  },
];

// Endpoint to logout the WhatsApp client and clear the server cache
exports.logoutWhatsApp = async (req, res) => {
  try {
    if (client && client.info && client.info.wid) {
      try {
        // Logout from WhatsApp
        await client.logout();
      } catch (logoutError) {
        console.warn("Error during logout:", logoutError.message);
      }
    }

    // Destroy client and clean up data regardless of logout success
    destroyClient();
    cleanupWhatsAppData();

    res.json({
      status: "success",
      message: "Logged out and cache cleared successfully",
    });
  } catch (error) {
    console.error("Error during logout:", error);
    
    // Force cleanup even if logout failed
    destroyClient();
    cleanupWhatsAppData();
    
    res.json({
      status: "success",
      message: "Cache cleared successfully (forced cleanup)",
    });
  }
};

// Endpoint to fetch the current connected user's profile
exports.getUserProfile = async (req, res) => {
  try {
    if (client && client.info && client.info.wid && isClientReady) {
      const userId = client.info.wid._serialized;
      const profilePicUrl = await client.getProfilePicUrl(userId);
      const userName = client.info.pushname;
      const userNumber = client.info.me.user;

      res.json({
        status: "success",
        data: {
          name: userName,
          number: userNumber,
          profilePicUrl: profilePicUrl,
        },
      });
    } else {
      res
        .status(400)
        .json({
          status: "failure",
          message: "WhatsApp client is not connected",
        });
    }
  } catch (error) {
    console.error("Error fetching user profile:", error);
    res.status(500).json({ error: "Failed to fetch user profile" });
  }
};

// Graceful shutdown handling
process.on('SIGINT', () => {
  console.log('Received SIGINT, cleaning up...');
  destroyClient();
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('Received SIGTERM, cleaning up...');
  destroyClient();
  process.exit(0);
});