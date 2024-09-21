const { Client, MessageMedia, LocalAuth } = require('whatsapp-web.js'); 
const express = require('express');
const fs = require('fs');
const path = require('path');
const QRCode = require('qrcode');
const { check, validationResult } = require('express-validator'); 

// Variables to store the client and QR code data
let client = null;
let clientInitialized = false;
let currentQRCodeDataURL = null;

// Function to initialize the client and wait for QR code
function initializeClient() {
  return new Promise((resolve, reject) => {
    if (clientInitialized) {
      // If client is already initializing, wait for QR code
      const checkInterval = setInterval(() => {
        if (currentQRCodeDataURL) {
          clearInterval(checkInterval);
          resolve(currentQRCodeDataURL);
        }
      }, 1000);
      return;
    }

    clientInitialized = true;

    // Initialize WhatsApp client with session persistence
    client = new Client({
      authStrategy: new LocalAuth({
        clientId: 'client-one',
        dataPath: path.join(__dirname, '../.wwebjs_auth')
      }),
      qrMaxRetries: 0 // Prevent continuous QR code generation
    });

    // Generate QR code when 'qr' event is emitted
    client.on('qr', async (qr) => {
      try {
        currentQRCodeDataURL = await QRCode.toDataURL(qr);
        console.log('QR code received, scan with your phone');
        resolve(currentQRCodeDataURL); // Resolve the promise with the QR code
      } catch (err) {
        console.error('Error generating QR code:', err);
        reject(err);
      }
    });

    // Log when the client is ready to use
    client.on('ready', () => {
      console.log('WhatsApp client is ready!');
      currentQRCodeDataURL = null; // Clear QR code data
    });

    // Log any authentication-related issues
    client.on('authenticated', () => {
      console.log('Authenticated successfully!');
    });

    // Handle authentication failure
    client.on('auth_failure', (msg) => {
      console.error('Authentication failure:', msg);
      reject(new Error('Authentication failure'));
    });

    // Initialize the client
    client.initialize();
  });
}

// Endpoint to check session status and return QR code if not authenticated
exports.checkSession = async (req, res) => {
  if (client && client.info && client.info.wid) {
    // Session is active
    res.json({ status: 'success', message: 'Session is active' });
  } else {
    try {
      // Initialize the client and wait for the QR code
      const qrCodeDataURL = await initializeClient();
      res.json({
        status: 'failure',
        message: 'No active session. Please scan the QR code.',
        qrCode: qrCodeDataURL
      });
    } catch (err) {
      console.error('Error during client initialization:', err);
      res.status(500).json({ error: 'Failed to initialize WhatsApp client' });
    }
  }
};

// Controller function to send WhatsApp message with attachment and text
exports.sendWhatsAppMessage = [
  [
    check('phoneNumber')
      .isMobilePhone()
      .withMessage('Please enter a valid phone number'),
    check('messageText')
      .isLength({ min: 1 })
      .withMessage('Message text cannot be empty'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { phoneNumber, messageText } = req.body;
    const attachmentPath = req.file ? req.file.path : null;

    try {
      if (!client || !client.info || !client.info.wid) {
        return res.status(400).json({ error: 'WhatsApp client is not connected' });
      }

      const formattedPhoneNumber = `${phoneNumber.replace(/\D/g, '')}@c.us`;

      if (attachmentPath) {
        const media = MessageMedia.fromFilePath(attachmentPath);
        await client.sendMessage(formattedPhoneNumber, media, { caption: messageText });
        fs.unlinkSync(attachmentPath);
      } else {
        await client.sendMessage(formattedPhoneNumber, messageText);
      }

      res.json({ message: 'WhatsApp message sent successfully!' });
    } catch (error) {
      console.error('Error sending WhatsApp message:', error);
      res.status(500).json({ error: 'Failed to send message' });
    }
  },
];
