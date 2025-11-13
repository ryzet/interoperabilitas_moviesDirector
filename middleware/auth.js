const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET;

function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  console.log("Authorization Header:", authHeader);  

  const token = authHeader && authHeader.split(' ')[1];
  console.log("Extracted Token:", token);  

  if (!token == null) {
    return res.status(401).json({ error: 'Akses ditolak, token tidak ditemukan' });
  }

  jwt.verify(token, JWT_SECRET, (err, decodedPayload) => {
    if (err) {
      console.error("JWT Verify Error:", err.message); 
      return res.status(403).json({ error: 'Token tidak valid atau kedaluwarsa' });
    }

    console.log("Decoded Token Payload:", decodedPayload); ``
    req.user = decodedPayload.user;
    {id, username, role}
    next();
  });
}

function authorizeRole(role) {
  return (req, res, next) => {
    if (req.user && req.user.role === role) {
      next();
    } else {
      return res.status(403).json({ error: 'Akses dilarang: peran tidak memadai' });
    }
  };
}

module.exports = {authenticateToken, authorizeRole};
