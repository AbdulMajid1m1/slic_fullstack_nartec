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
let isIntentionalLogout = false;
let initializationInProgress = false;
let reconnectAttempts = 0;
const MAX_RECONNECT_ATTEMPTS = 3;

// Function to forcefully remove directories with multiple fallback methods
function forceRemoveDirectory(dirPath) {
  if (!fs.existsSync(dirPath)) {
    return true;
  }

  try {
    fs.rmSync(dirPath, { recursive: true, force: true });
    console.log(`Successfully removed directory: ${dirPath}`);
    return true;
  } catch (error) {
    console.warn(`Method 1 failed for ${dirPath}:`, error.message);
    
    try {
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
  
  if (fs.existsSync(authPath)) {
    forceRemoveDirectory(authPath);
  }
  
  if (fs.existsSync(cachePath)) {
    forceRemoveDirectory(cachePath);
  }
}

// Function to destroy existing client properly
async function destroyClient(skipPageClose = false) {
  console.log("Destroying client...");
  if (client) {
    try {
      client.removeAllListeners();
      
      // Only try to close page/browser if not already closed and not skipping
      if (!skipPageClose) {
        if (client.pupPage) {
          try {
            if (!client.pupPage.isClosed()) {
              await client.pupPage.close().catch(e => console.warn("Page close error:", e.message));
            }
          } catch (e) {
            console.warn("Error checking/closing page:", e.message);
          }
        }
        
        if (client.pupBrowser) {
          try {
            await client.pupBrowser.close().catch(e => console.warn("Browser close error:", e.message));
          } catch (e) {
            console.warn("Error closing browser:", e.message);
          }
        }
      }
      
      await client.destroy().catch(e => console.warn("Client destroy error:", e.message));
      console.log("Client destroyed successfully");
    } catch (error) {
      console.warn("Error destroying client:", error.message);
    }
  }
  client = null;
  clientInitialized = false;
  isClientReady = false;
  currentQRCodeDataURL = null;
  initializationInProgress = false;
}

// Check if client is in a healthy state
function isClientHealthy() {
  try {
    if (!client || !isClientReady) {
      return false;
    }
    
    // Check if we have the necessary info
    if (!client.info || !client.info.wid) {
      return false;
    }
    
    // Check if Puppeteer page is still alive
    if (!client.pupPage || client.pupPage.isClosed()) {
      return false;
    }
    
    return true;
  } catch (error) {
    console.warn("Error checking client health:", error.message);
    return false;
  }
}

// Function to initialize the client and wait for QR code
async function initializeClient(forceNew = false) {
  // Prevent multiple simultaneous initializations
  if (initializationInProgress && !forceNew) {
    console.log("Initialization already in progress, waiting...");
    let waitTime = 0;
    while (initializationInProgress && waitTime < 30000) {
      await new Promise(resolve => setTimeout(resolve, 500));
      waitTime += 500;
    }
    return { status: isClientReady ? 'ready' : 'initializing' };
  }

  // If client is already ready and healthy, return immediately
  if (!forceNew && isClientHealthy()) {
    console.log("Client is already healthy and ready");
    reconnectAttempts = 0; // Reset reconnect attempts on successful check
    return { status: 'ready' };
  }

  initializationInProgress = true;

  try {
    // If forcing new client, clean up everything first
    if (forceNew) {
      console.log("Force new client requested, cleaning up...");
      await destroyClient(false);
      await new Promise(r => setTimeout(r, 2000));
      cleanupWhatsAppData();
      await new Promise(r => setTimeout(r, 1000));
      reconnectAttempts = 0;
    }

    // If client exists but is not healthy, destroy it
    if (client && !isClientHealthy()) {
      console.log("Client exists but is not healthy, destroying...");
      await destroyClient(true); // Skip page close since it's already problematic
      await new Promise(r => setTimeout(r, 1000));
    }

    if (client && clientInitialized && isClientReady && isClientHealthy()) {
      console.log("Client already initialized and ready");
      initializationInProgress = false;
      reconnectAttempts = 0;
      return { status: 'ready' };
    }

    return new Promise((resolve, reject) => {
      clientInitialized = true;
      isIntentionalLogout = false;
      console.log("Starting new client initialization...");

      // Check if we have an existing session
      const sessionExists = hasExistingSession();
      console.log(`Initializing client... Existing session found: ${sessionExists}`);

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
            '--disable-web-security',
            '--disable-features=IsolateOrigins,site-per-process',
            '--disable-blink-features=AutomationControlled',
            '--user-agent=Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
          ]
        },
        // Don't show QR if session exists, only if no session (for new connections)
        qrMaxRetries: sessionExists ? 0 : 5
      });

      let resolved = false;

      // Generate QR code when 'qr' event is emitted
      client.on("qr", async (qr) => {
        try {
          currentQRCodeDataURL = await QRCode.toDataURL(qr);
          console.log("QR code received, scan with your phone");

          // Only resolve with QR if we don't have a session (new connection)
          // If session exists but QR is shown, it means session failed to load
          if (!resolved && !sessionExists) {
            resolved = true;
            initializationInProgress = false;
            resolve({ status: 'qr', qrCode: currentQRCodeDataURL });
          } else if (!resolved && sessionExists) {
            // Session exists but QR shown - session might be corrupted
            console.warn("QR shown despite existing session - session may be corrupted");
          }
        } catch (err) {
          console.error("Error generating QR code:", err);
          if (!resolved) {
            resolved = true;
            initializationInProgress = false;
            reject(err);
          }
        }
      });

      // Log when the client is ready to use
      client.on("ready", () => {
        console.log("WhatsApp client is ready!");
        isClientReady = true;
        currentQRCodeDataURL = null;
        reconnectAttempts = 0; // Reset on successful connection
        
        if (!resolved) {
          resolved = true;
          initializationInProgress = false;
          resolve({ status: 'ready' });
        }
      });

      client.on("authenticated", () => {
        console.log("Authenticated successfully!");
        isClientReady = false; // Not ready until 'ready' event fires
      });

      client.on("auth_failure", async (msg) => {
        console.error("Authentication failure:", msg);
        console.log("Session may be corrupted, cleaning up...");

        // Clean up corrupted session
        await destroyClient(true);
        cleanupWhatsAppData();

        if (!resolved) {
          resolved = true;
          initializationInProgress = false;
          // Return a status that indicates need for QR instead of rejecting
          resolve({ status: 'auth_failed', needsQR: true });
        }
      });

      // CRITICAL: Handle disconnection events with better logic
      client.on("disconnected", async (reason) => {
        console.log(`WhatsApp client disconnected. Reason: ${reason}, Intentional: ${isIntentionalLogout}`);
        isClientReady = false;
        
        // If it was an intentional logout, clean everything
        if (isIntentionalLogout) {
          console.log("Intentional logout - destroying client and clearing data");
          await destroyClient(true);
          cleanupWhatsAppData();
          isIntentionalLogout = false;
          reconnectAttempts = 0;
          return;
        }
        
        // Check reconnect attempts to avoid infinite loops
        if (reconnectAttempts >= MAX_RECONNECT_ATTEMPTS) {
          console.log(`Max reconnect attempts (${MAX_RECONNECT_ATTEMPTS}) reached. Stopping reconnection.`);
          await destroyClient(true);
          reconnectAttempts = 0;
          return;
        }
        
        reconnectAttempts++;
        console.log(`Unexpected disconnection (attempt ${reconnectAttempts}/${MAX_RECONNECT_ATTEMPTS}) - will reconnect on next request`);
        
        // Don't auto-reconnect immediately - let it reconnect on next API call
        // This prevents the infinite loop issue
        await destroyClient(true);
      });

      // Keep the session alive with periodic pings
      client.on("change_state", (state) => {
        console.log("Client state changed:", state);
      });

      client.on("loading_screen", (percent, message) => {
        console.log("Loading screen:", percent, message);
      });

      // Handle remote session saved
      client.on("remote_session_saved", () => {
        console.log("Remote session saved");
      });

      // Handle initialization errors (like network errors)
      client.on("error", (error) => {
        console.error("Client error:", error);

        // Check for network-related errors
        if (error.message && (
          error.message.includes('ERR_NAME_NOT_RESOLVED') ||
          error.message.includes('ERR_INTERNET_DISCONNECTED') ||
          error.message.includes('net::ERR')
        )) {
          console.error("Network error detected during initialization");
          if (!resolved) {
            resolved = true;
            initializationInProgress = false;
            reject(new Error("Network error: Unable to reach WhatsApp Web. Please check your internet connection."));
          }
        }
      });

      // Timeout for initialization - longer if we have a session (it needs time to restore)
      const timeout = sessionExists ? 120000 : 60000;
      setTimeout(() => {
        if (!resolved) {
          resolved = true;
          initializationInProgress = false;

          // If we have a session but timed out, it might be corrupted
          if (sessionExists) {
            console.log("Session restoration timed out, session may be corrupted");
            resolve({ status: 'auth_failed', needsQR: true });
          } else {
            reject(new Error("Client initialization timeout"));
          }
        }
      }, timeout);

      // Initialize the client
      try {
        client.initialize();
      } catch (error) {
        console.error("Error initializing client:", error);

        // Check if it's a network error
        if (error.message && error.message.includes('ERR_NAME_NOT_RESOLVED')) {
          console.error("Network/DNS error - unable to reach WhatsApp Web");
          initializationInProgress = false;
          reject(new Error("Network error: Unable to reach WhatsApp Web. Please check your internet connection."));
        } else {
          initializationInProgress = false;
          reject(error);
        }
      }
    });
  } catch (error) {
    console.error("Error in initializeClient:", error);
    initializationInProgress = false;
    throw error;
  }
}

// Check if session exists before auto-initializing
function hasExistingSession() {
  const authPath = path.join(__dirname, "../.wwebjs_auth/session-client-one");
  return fs.existsSync(authPath);
}

// Auto-initialize client on server start (will use existing session if available)
// TEMPORARILY DISABLED - Testing network issue
// setTimeout(async () => {
//   const sessionExists = hasExistingSession();
//   console.log(`Auto-initializing client on server start... Session exists: ${sessionExists}`);

//   if (sessionExists) {
//     console.log("Found existing session, auto-initializing...");
//     try {
//       await initializeClient(false);
//       console.log("Auto-initialization completed successfully");
//     } catch (error) {
//       console.error("Auto-initialization failed:", error.message);
//       // Session might be corrupted, will retry on first API call
//     }
//   } else {
//     console.log("No existing session found, waiting for user to connect");
//   }
// }, 3000);

console.log("Auto-initialization disabled - user must manually connect");

// Endpoint to check session status and return QR code if not authenticated
exports.checkSession = async (req, res) => {
  try {
    // Check if client is healthy
    if (isClientHealthy()) {
      return res.json({ status: "success", message: "Session is active" });
    }

    // Client is not healthy, initialize it (will use existing session if available)
    const forceNew = req.query.forceNew === 'true';

    try {
      const result = await initializeClient(forceNew);

      if (result.status === 'ready') {
        res.json({ status: "success", message: "Session is active" });
      } else if (result.status === 'qr') {
        res.json({
          status: "failure",
          message: "No active session. Please scan the QR code.",
          qrCode: result.qrCode,
        });
      } else if (result.status === 'auth_failed') {
        // Session was corrupted, need fresh QR - force new initialization
        const freshResult = await initializeClient(true);
        if (freshResult.status === 'qr') {
          res.json({
            status: "failure",
            message: "Session expired. Please scan QR code to reconnect.",
            qrCode: freshResult.qrCode,
          });
        } else {
          res.json({
            status: "initializing",
            message: "Client is initializing, please wait..."
          });
        }
      } else {
        res.json({
          status: "initializing",
          message: "Client is initializing, please wait..."
        });
      }
    } catch (err) {
      console.error("Error during client initialization:", err);
      res.status(500).json({ error: "Failed to initialize WhatsApp client" });
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
      // Check if client is healthy, if not try to reconnect
      if (!isClientHealthy()) {
        console.log("Client not healthy for sending message, attempting to initialize...");
        const result = await initializeClient(false);
        if (result.status !== 'ready') {
          return res.status(400).json({ error: "WhatsApp client is not connected. Please connect first." });
        }
      }

      const formattedPhoneNumber = `${phoneNumber.replace(/\D/g, "")}@c.us`;

      if (attachmentPath) {
        const media = MessageMedia.fromFilePath(attachmentPath);
        await client.sendMessage(formattedPhoneNumber, media, {
          caption: messageText,
        });
        
        try {
          fs.unlinkSync(attachmentPath);
        } catch (fileError) {
          console.warn("Could not remove uploaded file:", fileError.message);
        }
      } else {
        await client.sendMessage(formattedPhoneNumber, messageText);
      }

      const ratingLink =
        "https://docs.google.com/forms/d/e/1FAIpQLSceYlSsIGZ9j6YjB0pFBnn7xcWBSRP7UOmYalyPPrWstvVvQA/viewform";
      const ratingMessage = `We value your feedback! Please take a moment to rate your purchase order: ${ratingLink}`;
      
      await client.sendMessage(formattedPhoneNumber, ratingMessage);

      res.json({ message: "WhatsApp messages sent successfully!" });
    } catch (error) {
      console.error("Error sending WhatsApp message:", error);
      res.status(500).json({ error: "Failed to send messages" });
      
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
    console.log("Logout requested - setting intentional logout flag");
    // CRITICAL: Set flag BEFORE logout
    isIntentionalLogout = true;
    reconnectAttempts = 0;
    
    if (client && client.info && client.info.wid) {
      try {
        await client.logout();
        console.log("Logout command sent successfully");
      } catch (logoutError) {
        console.warn("Error during logout:", logoutError.message);
      }
    }

    // Wait for disconnect event to fire
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Ensure cleanup happened
    if (client) {
      await destroyClient(true);
      cleanupWhatsAppData();
    }

    res.json({
      status: "success",
      message: "Logged out and cache cleared successfully",
    });
  } catch (error) {
    console.error("Error during logout:", error);
    
    // Force cleanup
    isIntentionalLogout = true;
    await destroyClient(true);
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
    // First check if client is healthy
    if (!isClientHealthy()) {
      console.log("Client not healthy for getUserProfile, attempting to reconnect...");

      // If client exists and is initialized but not ready yet, wait for it
      if (client && clientInitialized && !isClientReady) {
        console.log("Client is initializing, waiting for ready event...");

        // Wait up to 30 seconds for the client to become ready
        let waitTime = 0;
        while (!isClientReady && waitTime < 30000) {
          await new Promise(resolve => setTimeout(resolve, 1000));
          waitTime += 1000;

          if (isClientReady) {
            console.log("Client became ready while waiting");
            break;
          }
        }

        if (!isClientReady) {
          return res.status(400).json({
            status: "failure",
            message: "WhatsApp client is still initializing",
            needsConnection: true
          });
        }
      } else {
        // Client doesn't exist or failed, try to initialize
        try {
          const result = await initializeClient(false);

          if (result.status !== 'ready') {
            return res.status(400).json({
              status: "failure",
              message: "WhatsApp client is not connected",
              needsConnection: true
            });
          }

          // Give it a moment to fully stabilize
          await new Promise(resolve => setTimeout(resolve, 1000));

        } catch (initError) {
          console.error("Failed to initialize client:", initError);
          return res.status(400).json({
            status: "failure",
            message: "WhatsApp client is not connected",
            needsConnection: true
          });
        }
      }
    }

    // Double check health after potential initialization
    if (!isClientHealthy()) {
      return res.status(400).json({
        status: "failure",
        message: "WhatsApp client is not connected",
        needsConnection: true
      });
    }

    const userId = client.info.wid._serialized;
    
    let profilePicUrl;
    try {
      profilePicUrl = await client.getProfilePicUrl(userId);
    } catch (picError) {
      console.warn("Could not fetch profile picture:", picError.message);
      profilePicUrl = null;
    }
    
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
  } catch (error) {
    console.error("Error fetching user profile:", error);
    
    // If we get a context destroyed error, the client is dead
    if (error.message && (
      error.message.includes("Execution context was destroyed") ||
      error.message.includes("Target closed") ||
      error.message.includes("Protocol error")
    )) {
      console.log("Client context destroyed, marking as unhealthy");
      isClientReady = false;
    }
    
    res.status(500).json({ 
      error: "Failed to fetch user profile",
      needsConnection: true
    });
  }
};

// Graceful shutdown handling
process.on('SIGINT', async () => {
  console.log('Received SIGINT, cleaning up...');
  isIntentionalLogout = true;
  await destroyClient(false);
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('Received SIGTERM, cleaning up...');
  isIntentionalLogout = true;
  await destroyClient(false);
  process.exit(0);
});