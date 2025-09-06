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
let authenticationComplete = false;
let sessionRestored = false;

// Helper function to add delay
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Function to check if session data exists
function hasExistingSession() {
  const authPath = path.join(__dirname, "../.wwebjs_auth/session-client-one");
  try {
    return fs.existsSync(authPath) && fs.readdirSync(authPath).length > 0;
  } catch (error) {
    return false;
  }
}

// Enhanced function to check if client is truly ready for messaging
async function isClientReadyForMessaging() {
  console.log("isClientReadyForMessaging");
  console.log("client", !!client);
  console.log("authenticationComplete", authenticationComplete);
  
  if (!client || !authenticationComplete) return false;
  
  try {
    // Multiple checks to ensure client is fully operational
    const state = await client.getState();
    console.log("Client state:", state);
    
    if (state !== 'CONNECTED') return false;
    
    // Additional check: try to get client info
    const info = client.info;
    if (!info || !info.wid) return false;
    
    // Check if we can access the page context
    const page = client.pupPage;
    if (!page) return false;
    
    // Wait for WhatsApp Web to be fully loaded
    try {
      await page.waitForSelector('[data-testid="compose-btn-send"]', { 
        timeout: 5000,
        visible: true 
      });
      
      // Additional check for chat list
      await page.waitForSelector('[data-testid="chat-list"]', { 
        timeout: 5000 
      });
      
      return true;
    } catch (selectorError) {
      console.log("WhatsApp Web UI not fully loaded:", selectorError.message);
      return false;
    }
    
  } catch (error) {
    console.log("Client not ready yet:", error.message);
    return false;
  }
}

// Function to wait for client to be messaging-ready with better checks
async function waitForMessagingReady(maxWaitTime = 45000) {
  const startTime = Date.now();
  const checkInterval = 2000; // Check every 2 seconds
  
  while (Date.now() - startTime < maxWaitTime) {
    console.log("Waiting for messaging ready...");
    
    if (await isClientReadyForMessaging()) {
      // Additional wait to ensure stability
      await delay(3000);
      
      // Double-check after the delay
      if (await isClientReadyForMessaging()) {
        console.log("Client is fully ready for messaging!");
        return true;
      }
    }
    
    await delay(checkInterval);
  }
  
  console.log("Timeout waiting for messaging ready state");
  return false;
}

// Function to safely send message with retries
async function safeSendMessage(phoneNumber, content, options = {}, retries = 3) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      console.log(`Message send attempt ${attempt}/${retries}`);
      
      // Verify client is ready before each attempt
      const ready = await isClientReadyForMessaging();
      if (!ready) {
        throw new Error("Client not ready for messaging");
      }
      
      // Add a small delay before sending
      await delay(1000);
      
      // Send the message
      const result = await client.sendMessage(phoneNumber, content, options);
      console.log(`Message sent successfully on attempt ${attempt}`);
      return result;
      
    } catch (error) {
      console.error(`Message send attempt ${attempt} failed:`, error.message);
      
      if (attempt === retries) {
        throw error; // Re-throw on final attempt
      }
      
      // Wait longer between retries
      const waitTime = attempt * 3000; // 3s, 6s, 9s...
      console.log(`Waiting ${waitTime}ms before retry...`);
      await delay(waitTime);
      
      // Check if we need to reinitialize
      if (error.message.includes('Target closed') || error.message.includes('Session closed')) {
        console.log("Client session seems closed, marking for reinitialization");
        authenticationComplete = false;
        isClientReady = false;
        throw new Error("Client session closed, please reinitialize");
      }
    }
  }
}

// Function to initialize the client and wait for QR code
function initializeClient() {
  return new Promise((resolve, reject) => {
    // If client is already authenticated and ready, return immediately
    if (authenticationComplete && client) {
      isClientReadyForMessaging().then(ready => {
        if (ready) {
          resolve(null); // No QR needed
        } else {
          // Wait a bit more for client to be ready
          setTimeout(async () => {
            const stillReady = await isClientReadyForMessaging();
            resolve(stillReady ? null : currentQRCodeDataURL);
          }, 5000);
        }
      });
      return;
    }

    if (clientInitialized) {
      // If client is already initializing, wait for QR code or completion
      const checkInterval = setInterval(async () => {
        if (authenticationComplete) {
          const ready = await isClientReadyForMessaging();
          if (ready) {
            clearInterval(checkInterval);
            resolve(null);
          }
        } else if (currentQRCodeDataURL) {
          clearInterval(checkInterval);
          resolve(currentQRCodeDataURL);
        }
      }, 1000);

      // Timeout after 60 seconds for session restoration
      setTimeout(() => {
        clearInterval(checkInterval);
        if (currentQRCodeDataURL) {
          resolve(currentQRCodeDataURL);
        } else if (authenticationComplete) {
          resolve(null);
        } else {
          reject(new Error("Initialization timeout"));
        }
      }, 60000);
      return;
    }

    clientInitialized = true;
    isClientReady = false;
    authenticationComplete = false;
    sessionRestored = false;
    currentQRCodeDataURL = null;

    // Check if we have an existing session
    const hasSession = hasExistingSession();
    console.log("Existing session found:", hasSession);

    try {
      // Clean up any existing client
      if (client) {
        try {
          client.removeAllListeners();
          client.destroy();
        } catch (cleanupErr) {
          console.log("Cleanup error (non-critical):", cleanupErr.message);
        }
      }

      // Initialize WhatsApp client with enhanced configuration
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
            '--disable-extensions',
            '--disable-features=VizDisplayCompositor',
            '--disable-background-timer-throttling',
            '--disable-backgrounding-occluded-windows',
            '--disable-renderer-backgrounding'
          ],
          defaultViewport: { width: 1280, height: 720 }, // Set a proper viewport
        },
        qrMaxRetries: 5,
        restartOnAuthFail: true,
        authTimeoutMs: 60000,
        takeoverOnConflict: false,
        // Add session timeout and other options
        session: null,
        qrTimeoutMs: 60000,
      });

      let hasResolved = false;
      let sessionRestorationTimeout;

      // If we have an existing session, give it more time to restore
      if (hasSession) {
        console.log("Attempting to restore existing session...");
        sessionRestorationTimeout = setTimeout(() => {
          if (!hasResolved && !authenticationComplete) {
            console.log("Session restoration timeout, may need QR code");
          }
        }, 30000);
      }

      // Generate QR code when 'qr' event is emitted
      client.on("qr", async (qr) => {
        try {
          if (sessionRestorationTimeout) {
            clearTimeout(sessionRestorationTimeout);
          }
          
          currentQRCodeDataURL = await QRCode.toDataURL(qr);
          console.log("QR code received, scan with your phone");
          
          if (!hasResolved) {
            hasResolved = true;
            resolve(currentQRCodeDataURL);
          }
        } catch (err) {
          console.error("Error generating QR code:", err);
          if (!hasResolved) {
            hasResolved = true;
            reject(err);
          }
        }
      });

      // Handle loading screen progress
      client.on("loading_screen", (percent, message) => {
        console.log(`Loading screen: ${percent}% - ${message}`);
        
        // If we're at 100%, session should be restored soon
        if (percent === 100 && hasSession && !sessionRestored) {
          console.log("Loading complete, waiting for session restoration...");
        }
      });

      // Log any authentication-related issues
      client.on("authenticated", (session) => {
        console.log("Authenticated successfully!");
        authenticationComplete = true;
        sessionRestored = hasSession;
        currentQRCodeDataURL = null; // Clear QR code data
        
        if (sessionRestorationTimeout) {
          clearTimeout(sessionRestorationTimeout);
        }
        
        // Don't resolve here immediately, wait for ready state
        if (!hasResolved) {
          // Give it more time to become fully ready
          setTimeout(async () => {
            if (!hasResolved) {
              const ready = await isClientReadyForMessaging();
              if (ready || authenticationComplete) {
                hasResolved = true;
                resolve(null);
              }
            }
          }, 8000); // Increased wait time
        }
      });

      // Log when the client is ready to use
      client.on("ready", async () => {
        console.log("WhatsApp client is ready!");
        isClientReady = true;
        authenticationComplete = true;
        currentQRCodeDataURL = null;
        
        if (sessionRestorationTimeout) {
          clearTimeout(sessionRestorationTimeout);
        }
        
        // Wait for the UI to be fully loaded
        console.log("Waiting for WhatsApp Web UI to fully load...");
        await delay(5000);
        
        // Verify the client is actually ready for messaging
        const messagingReady = await isClientReadyForMessaging();
        console.log("Client messaging ready:", messagingReady);
        
        if (!hasResolved) {
          hasResolved = true;
          resolve(null);
        }
      });

      // Handle authentication failure
      client.on("auth_failure", (msg) => {
        console.error("Authentication failure:", msg);
        isClientReady = false;
        authenticationComplete = false;
        clientInitialized = false;
        sessionRestored = false;
        currentQRCodeDataURL = null;
        
        if (sessionRestorationTimeout) {
          clearTimeout(sessionRestorationTimeout);
        }
        
        // Clear corrupted session data
        try {
          const authPath = path.join(__dirname, "../.wwebjs_auth");
          if (fs.existsSync(authPath)) {
            fs.rmSync(authPath, { recursive: true, force: true });
            console.log("Cleared corrupted session data");
          }
        } catch (cleanupError) {
          console.error("Error clearing session data:", cleanupError);
        }
        
        client = null;
        
        if (!hasResolved) {
          hasResolved = true;
          reject(new Error(`Authentication failure: ${msg}`));
        }
      });

      // Handle disconnection
      client.on("disconnected", (reason) => {
        console.log("Client disconnected:", reason);
        isClientReady = false;
        authenticationComplete = false;
        sessionRestored = false;
        
        // If it's a logout, clear the session
        if (reason === 'LOGOUT') {
          clientInitialized = false;
          currentQRCodeDataURL = null;
          client = null;
        } else {
          // For other disconnections, try to reconnect
          console.log("Attempting to reconnect...");
        }
      });

      // Handle change state events
      client.on("change_state", (state) => {
        console.log("Client state changed:", state);
        if (state === 'CONNECTED') {
          authenticationComplete = true;
          isClientReady = true;
        }
      });

      // Initialize the client
      console.log("Initializing WhatsApp client...");
      client.initialize();

      // Fallback timeout - resolve with current state after longer time for session restoration
      const timeoutDuration = hasSession ? 60000 : 50000;
      setTimeout(() => {
        if (!hasResolved) {
          console.log("Initialization timeout reached");
          if (sessionRestorationTimeout) {
            clearTimeout(sessionRestorationTimeout);
          }
          
          if (authenticationComplete) {
            hasResolved = true;
            resolve(null);
          } else if (currentQRCodeDataURL) {
            hasResolved = true;
            resolve(currentQRCodeDataURL);
          } else {
            hasResolved = true;
            reject(new Error("Initialization timeout - session may be corrupted"));
          }
        }
      }, timeoutDuration);

    } catch (error) {
      console.error("Error during client initialization:", error);
      clientInitialized = false;
      isClientReady = false;
      authenticationComplete = false;
      sessionRestored = false;
      reject(error);
    }
  });
}

// Auto-initialize client on server start if session exists
function autoInitializeOnStartup() {
  const hasSession = hasExistingSession();
  if (hasSession) {
    console.log("Found existing session, attempting auto-initialization...");
    initializeClient()
      .then((result) => {
        if (result === null) {
          console.log("✅ Session restored successfully on startup!");
        } else {
          console.log("⚠️ Session restoration failed, QR code will be required");
        }
      })
      .catch((error) => {
        console.error("❌ Auto-initialization failed:", error.message);
        // Reset state for manual initialization
        clientInitialized = false;
        authenticationComplete = false;
        sessionRestored = false;
      });
  }
}

// Call auto-initialization when module loads
setTimeout(() => {
  autoInitializeOnStartup();
}, 2000);

// Endpoint to check session status and return QR code if not authenticated
exports.checkSession = async (req, res) => {
  console.log("Checking session... Auth complete:", authenticationComplete, "Ready:", isClientReady);
  
  // Check if already authenticated and ready
  if (authenticationComplete && client) {
    const messagingReady = await isClientReadyForMessaging();
    if (messagingReady) {
      res.json({ status: "success", message: "Session is active" });
      return;
    }
  }

  try {
    // Initialize the client and wait for the QR code
    const qrCodeDataURL = await initializeClient();
    
    if (qrCodeDataURL) {
      res.json({
        status: "failure",
        message: "No active session. Please scan the QR code.",
        qrCode: qrCodeDataURL,
      });
    } else {
      // Client became ready during initialization
      res.json({ status: "success", message: "Session is active" });
    }
  } catch (err) {
    console.error("Error during client initialization:", err);
    res.status(500).json({ error: "Failed to initialize WhatsApp client" });
  }
};

// Enhanced controller function to send WhatsApp message with attachment and text
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
      // Enhanced client readiness check
      console.log("Checking client readiness for messaging...");
      console.log("Auth complete:", authenticationComplete);
      console.log("Client exists:", !!client);
      console.log("Session restored:", sessionRestored);
      
      if (!authenticationComplete || !client) {
        return res.status(400).json({ 
          error: "WhatsApp client is not authenticated. Please scan QR code first." 
        });
      }

      // Wait for client to be messaging ready with reduced timeout
      console.log("Waiting for client to be messaging ready...");
      const messagingReady = await waitForMessagingReady(20000); // Reduced timeout
      
      if (!messagingReady) {
        console.log("Messaging not ready, trying basic approach...");
        
        // Fallback: try with basic checks
        if (client && authenticationComplete) {
          const state = await client.getState();
          if (state === 'CONNECTED') {
            console.log("Using basic connected state, proceeding with caution...");
          } else {
            return res.status(400).json({ 
              error: "WhatsApp client is not ready for messaging. Please try again or reinitialize the session." 
            });
          }
        } else {
          return res.status(400).json({ 
            error: "WhatsApp client is not ready for messaging. Please try again or reinitialize the session." 
          });
        }
      }

      console.log("Client is ready for messaging!");
      const formattedPhoneNumber = `${phoneNumber.replace(/\D/g, "")}@c.us`;

      let messagesSent = [];
      let errors = [];

      // 1️⃣ First message with media (if any)
      if (attachmentPath) {
        console.log("   📎 Sending media message...");
        try {
          const media = MessageMedia.fromFilePath(attachmentPath);
          console.log("   - Media object created, sending...");
          
          await safeSendMessage(formattedPhoneNumber, media, {
            caption: messageText,
          });
          
          console.log("   ✅ Media message sent successfully");
          messagesSent.push("media");
        } catch (err) {
          console.error("   ❌ Failed to send media message:", err);
          errors.push(`Media message failed: ${err.message}`);
        } finally {
          // Always cleanup the uploaded file
          try {
            if (fs.existsSync(attachmentPath)) {
              fs.unlinkSync(attachmentPath);
              console.log("   🗑️ Cleaned up attachment file");
            }
          } catch (unlinkErr) {
            console.error("   ❌ Error deleting file:", unlinkErr);
          }
        }
      } else {
        console.log("   📝 Sending text message...");
        try {
          await safeSendMessage(formattedPhoneNumber, messageText);
          console.log("   ✅ Text message sent successfully");
          messagesSent.push("text");
        } catch (err) {
          console.error("   ❌ Failed to send text message:", err);
          errors.push(`Text message failed: ${err.message}`);
        }
      }

      // Small delay between messages
      console.log("   ⏳ Waiting 3 seconds before sending rating message...");
      await delay(3000);

      // 2️⃣ Second message: feedback link
      const ratingLink =
        "https://docs.google.com/forms/d/e/1FAIpQLSceYlSsIGZ9j6YjB0pFBnn7xcWBSRP7UOmYalyPPrWstvVvQA/viewform";
      const ratingMessage = `We value your feedback! Please take a moment to rate your purchase order: ${ratingLink}`;

      console.log("   ⭐ Sending rating message...");
      try {
        await safeSendMessage(formattedPhoneNumber, ratingMessage);
        console.log("   ✅ Rating message sent successfully");
        messagesSent.push("rating");
      } catch (err) {
        console.error("   ❌ Failed to send rating message:", err);
        errors.push(`Rating message failed: ${err.message}`);
      }

      console.log("   🎉 All messages processed, sending response");
      
      // Return appropriate response based on results
      if (messagesSent.length > 0) {
        const response = { 
          message: "WhatsApp messages processed.", 
          sent: messagesSent,
          success: true
        };
        
        if (errors.length > 0) {
          response.warnings = errors;
          response.partialSuccess = true;
        }
        
        res.json(response);
      } else {
        res.status(500).json({ 
          error: "Failed to send any messages", 
          details: errors,
          success: false
        });
      }
      
    } catch (error) {
      console.error("❌ General error in sendWhatsAppMessage:", error);
      
      // Clean up attachment file if it exists
      if (attachmentPath && fs.existsSync(attachmentPath)) {
        try {
          fs.unlinkSync(attachmentPath);
        } catch (unlinkErr) {
          console.error("Error deleting file after error:", unlinkErr);
        }
      }
      
      res.status(500).json({ 
        error: "Failed to send messages", 
        details: error.message,
        success: false
      });
    }
  },
];

// Endpoint to logout the WhatsApp client and clear the server cache
exports.logoutWhatsApp = async (req, res) => {
  try {
    if (client && authenticationComplete) {
      // Logout from WhatsApp
      try {
        await client.logout();
      } catch (logoutErr) {
        console.error("Error during logout:", logoutErr);
      }

      // Clean up client
      try {
        client.removeAllListeners();
        client.destroy();
      } catch (destroyErr) {
        console.error("Error destroying client:", destroyErr);
      }
    }

    // Clear the authentication data
    const authPath = path.join(__dirname, "../.wwebjs_auth");
    try {
      if (fs.existsSync(authPath) && fs.statSync(authPath).isDirectory()) {
        fs.rmSync(authPath, { recursive: true, force: true });
      }
    } catch (fsErr) {
      console.error("Error clearing auth data:", fsErr);
    }

    // Reset client and flags
    client = null;
    clientInitialized = false;
    currentQRCodeDataURL = null;
    isClientReady = false;
    authenticationComplete = false;
    sessionRestored = false;

    res.json({
      status: "success",
      message: "Logged out and cache cleared successfully",
    });
  } catch (error) {
    console.error("Error during logout:", error);
    
    // Force reset even if there were errors
    client = null;
    clientInitialized = false;
    currentQRCodeDataURL = null;
    isClientReady = false;
    authenticationComplete = false;
    sessionRestored = false;
    
    res.status(500).json({ error: "Failed to logout and clear cache" });
  }
};

// Endpoint to fetch the current connected user's profile
exports.getUserProfile = async (req, res) => {
  try {
    if (!authenticationComplete || !client) {
      return res.status(400).json({
        status: "failure",
        message: "WhatsApp client is not connected",
      });
    }

    // Wait for messaging readiness
    const messagingReady = await waitForMessagingReady(10000);
    if (!messagingReady) {
      return res.status(400).json({
        status: "failure",
        message: "WhatsApp client is not ready",
      });
    }

    const userId = client.info.wid._serialized;
    let profilePicUrl = null;
    
    try {
      profilePicUrl = await client.getProfilePicUrl(userId);
    } catch (picErr) {
      console.log("Could not fetch profile picture:", picErr.message);
      // Continue without profile picture
    }
    
    const userName = client.info.pushname || 'Unknown';
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
    res.status(500).json({ error: "Failed to fetch user profile" });
  }
};


