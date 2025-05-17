// generate-jwt.js
const jwt = require("jsonwebtoken");

const payload = {
  id: "123",
  email: "rishi@example.com",
  role: "user"
};

const secret = "your_secret"; // This must match your Lambda's JWT_SECRET
const token = jwt.sign(payload, secret, { expiresIn: "1h" });

console.log("Bearer " + token);