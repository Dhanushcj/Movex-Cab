const fs = require('fs');
let c = fs.readFileSync('backend/src/controllers/bookingController.js', 'utf8');

// Find the QR mismatch block and replace it
const startMarker = '    // Ensure the scanned QR data matches the booking ID';
const endMarker = "    booking.status = 'in_progress';";

const startIdx = c.indexOf(startMarker);
const endIdx = c.indexOf(endMarker, startIdx);

if (startIdx === -1 || endIdx === -1) {
  console.log('Block not found!');
  console.log('startIdx:', startIdx, 'endIdx:', endIdx);
  process.exit(1);
}

const before = c.substring(0, startIdx);
const after = c.substring(endIdx); // starts with "    booking.status = 'in_progress';"

const newMiddle = `    // Verify QR data - accept if scanned data matches or contains the booking ID
    if (qrData !== undefined && qrData !== null) {
      const safeQrData = String(qrData).trim();
      const expectedId = String(booking._id).trim();
      console.log('[QR Verify] Expected: ' + expectedId + ', Scanned: ' + safeQrData);
      if (safeQrData !== expectedId && !safeQrData.includes(expectedId)) {
        return res.status(400).json({ success: false, message: 'Invalid Pass QR Code - does not match booking' });
      }
    }

    `;

c = before + newMiddle + after;
fs.writeFileSync('backend/src/controllers/bookingController.js', c, 'utf8');
console.log('Patched! New file length:', c.length);
console.log('Patch area:', JSON.stringify(c.substring(startIdx, startIdx + 400)));
