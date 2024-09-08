const { Client, MessageMedia, LocalAuth } = require('whatsapp-web.js');
const express = require('express');
const fs = require('fs');
const path = require('path');
const QRCode = require('qrcode');
const { check, validationResult } = require('express-validator'); 

// Initialize WhatsApp client with session persistence
const client = new Client({
  authStrategy: new LocalAuth({
    clientId: 'client-one',
    dataPath: path.join(__dirname, '../.wwebjs_auth')
  }),
});

// Variable to store the current QR code data URL
let currentQRCodeDataURL = null;

// Generate QR code if session is not saved
client.on('qr', async (qr) => {
  try {
    currentQRCodeDataURL = await QRCode.toDataURL(qr); // Convert QR code to data URL
    console.log('QR code received, scan with your phone');
  } catch (err) {
    console.error('Error generating QR code:', err);
  }
});

// Log when the client is ready to use
client.on('ready', () => {
  console.log('WhatsApp client is ready!');
  currentQRCodeDataURL = null;
});

// Log any authentication-related issues
client.on('authenticated', () => {
  console.log('Authenticated successfully!');
});

// Handle authentication failure
client.on('auth_failure', (msg) => {
  console.error('Authentication failure:', msg);
});

// Initialize the client
client.initialize();

// Endpoint to check session status and return QR code if not authenticated
exports.checkSession = (req, res) => {
  if (client.info && client.info.wid) {
    res.json({ status: 'success', message: 'Session is active' });
  } else {
    if (currentQRCodeDataURL) {
      res.json({
        status: 'failure',
        message: 'No active session. Please scan the QR code.',
        qrCode: currentQRCodeDataURL
      });
    } else {
      res.json({
        status: 'failure',
        message: 'No active session and QR code not available. Please try again.'
      });
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
