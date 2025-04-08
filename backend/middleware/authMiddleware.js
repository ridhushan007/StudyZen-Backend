const jwt = require('jsonwebtoken');

module.exports = function (req, res, next) {
  // Get token from header (e.g., x-auth-token)
  const token = req.header('x-auth-token');
  if (!token) {
    return res.status(401).json({ message: 'No token, authorization denied' });
  }

  try {
    // Verify token and attach the decoded user info (we expect payload: { user: { id: ... } })
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded.user;
    next();
  } catch (error) {
    console.error('JWT verification error:', error);
    res.status(401).json({ message: 'Token is not valid' });
  }
};