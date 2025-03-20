const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const speakeasy = require('speakeasy');
const QRCode = require('qrcode');
const { User } = require('../models/User');

const router = express.Router();

router.post('/register', async (req, res) => {
  const { username, password } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);
  const secret = speakeasy.generateSecret({ length: 20 }).base32;

  console.log(`Generated Secret for ${username}: ${secret}`); // to debug secret generation

  try {
      const user = await User.create({ 
          username, 
          password: hashedPassword, 
          twofa_secret: secret
      });

      res.json({
          message: 'User registered successfully!',
          secret, // To be used for QR code generation
      });

  } catch (error) {
      console.error("Error registering user:", error);
      res.status(400).json({ error: 'User already exists' });
  }
});

router.get('/qrcode/:username', async (req, res) => {
  try {
      const user = await User.findOne({ where: { username: req.params.username } });
      if (!user) return res.status(404).json({ error: 'User not found' });

      console.log(`Stored Secret for ${user.username}: ${user.twofa_secret}`); // Debugging

      // To Ensure correct format for QR Code generation
      const otpAuthURL = `otpauth://totp/Task1_2fa:${user.username}?secret=${user.twofa_secret}&issuer=Task1_2fa`;

      QRCode.toDataURL(otpAuthURL, (err, url) => {
          if (err) {
              console.error('Error generating QR code:', err);
              return res.status(500).json({ error: 'Error generating QR code' });
          }
          res.json({ qr: url });
      });

  } catch (error) {
      console.error('Error fetching user for QR code:', error);
      res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.post('/login', async (req, res) => {
    const { username, password, token } = req.body;
    const user = await User.findOne({ where: { username } });

    if (!user || !(await bcrypt.compare(password, user.password))) return res.status(401).json({ error: 'Invalid credentials' });
    if (!speakeasy.totp.verify({ secret: user.twofa_secret, encoding: 'base32', token })) return res.status(401).json({ error: 'Invalid 2FA token' });

    const jwtToken = jwt.sign({ id: user.id, username }, process.env.JWT_SECRET, { expiresIn: '10m' });
    res.json({ jwtToken });
});

module.exports = router;
