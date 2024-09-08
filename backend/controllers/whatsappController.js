const { Client, MessageMedia, LocalAuth } = require('whatsapp-web.js');
const { check, validationResult } = require('express-validator');
const fs = require('fs');
const path = require('path');

// Initialize WhatsApp client with session persistence
const client = new Client({
  authStrategy: new LocalAuth({
    clientId: 'client-one', // Unique identifier for the client to manage multiple sessions
    dataPath: path.join(__dirname, '../.wwebjs_auth') // Folder where session data will be stored
  }),
});

// Generate QR code if session is not saved
client.on('qr', (qr) => {
  const qrcode = require('qrcode-terminal');
  qrcode.generate(qr, { small: true });
  console.log('QR code received, scan with your phone');
});

// Log when the client is ready to use
client.on('ready', () => {
  console.log('WhatsApp client is ready!');
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
    const attachmentPath = req.file ? req.file.path : null; // Check if an attachment exists

    try {
      // Format the phone number for WhatsApp
      const formattedPhoneNumber = `${phoneNumber.replace(/\D/g, '')}@c.us`;

      if (attachmentPath) {
        // Read the uploaded file and create a WhatsApp message media object
        const media = MessageMedia.fromFilePath(attachmentPath);

        // Send the media and message text to the provided phone number
        await client.sendMessage(formattedPhoneNumber, media, { caption: messageText });

        // Delete the file after sending
        fs.unlinkSync(attachmentPath);
      } else {
        // Send just the message text without attachment
        await client.sendMessage(formattedPhoneNumber, messageText);
      }

      res.json({ message: 'WhatsApp message sent successfully!' });
    } catch (error) {
      console.error('Error sending WhatsApp message:', error);
      res.status(500).json({ error: 'Failed to send message' });
    }
  },
];
