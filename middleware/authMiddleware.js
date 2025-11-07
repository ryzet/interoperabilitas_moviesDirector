const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET;

function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  console.log("Authorization Header:", authHeader);  

  const token = authHeader && authHeader.split(' ')[1];
  console.log("Extracted Token:", token);  

  if (!token) {
    return res.status(401).json({ error: 'Akses ditolak, token tidak ditemukan' });
  }

  jwt.verify(token, JWT_SECRET, (err, decodedPayload) => {
    if (err) {
      console.error("JWT Verify Error:", err.message); 
      return res.status(403).json({ error: 'Token tidak valid atau kedaluwarsa' });
    }

    console.log("Decoded Token Payload:", decodedPayload); ``
    req.user = decodedPayload.user;

    next();
  });
}

module.exports = authenticateToken;
