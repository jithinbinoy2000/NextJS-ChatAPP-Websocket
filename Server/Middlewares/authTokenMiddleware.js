const jwt = require('jsonwebtoken');
const JWT_SECRET = "abcd";

module.exports.authenticationToken = (socket, next) => {
  const token = socket.handshake.auth.token;

  if (token) {
    try {
      const jwtResponse = jwt.verify(token, JWT_SECRET); // Clean token
      socket.user = jwtResponse;
      next();
    } catch (error) {
      console.error('Token verification error:', error);
      next(new Error("Authentication Error: Invalid token"));
    }
  } else {
    next(new Error("Authentication Error: No token provided"));
  }
};
