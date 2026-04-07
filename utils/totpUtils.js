/**
 * SecureAuth TOTP Utilities (Node.js/Express)
 * Time-based One-Time Password generation and verification
 * 
 * Author: Bwalya Adrian Mange (106-293)
 * Cavendish University Zambia
 */

const speakeasy = require('speakeasy');
const QRCode = require('qrcode');

const TOTP_ISSUER = process.env.TOTP_ISSUER || 'SecureAuth-CUZ';

/**
 * Generate TOTP secret
 */
function generateSecret() {
  const secret = speakeasy.generateSecret({
    name: TOTP_ISSUER,
    length: 32
  });

  return {
    base32_secret: secret.base32,
    otpauth_url: secret.otpauth_url
  };
}

/**
 * Generate QR code as base64 data URL
 */
async function generateQR(secret, email) {
  const otpauthUrl = speakeasy.otpauthURL({
    secret: secret,
    label: email,
    issuer: TOTP_ISSUER,
    encoding: 'base32'
  });

  try {
    const qrCodeDataURL = await QRCode.toDataURL(otpauthUrl);
    return qrCodeDataURL;
  } catch (error) {
    console.error('QR Code generation error:', error);
    throw new Error('Failed to generate QR code');
  }
}

/**
 * Verify TOTP code
 */
function verifyCode(secret, token, window = 1) {
  const verified = speakeasy.totp.verify({
    secret: secret,
    encoding: 'base32',
    token: token,
    window: window
  });

  return verified;
}

/**
 * Generate current TOTP code (for testing)
 */
function generateCode(secret) {
  const token = speakeasy.totp({
    secret: secret,
    encoding: 'base32'
  });

  return token;
}

module.exports = {
  generateSecret,
  generateQR,
  verifyCode,
  generateCode
};
