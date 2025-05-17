const jwt = require('jsonwebtoken');

const token = jwt.sign(
  {
    id: "123",
    email: "rishi@example.com",
    role: "user"
  },
  'your_secret',             // Match the Lambda env
  { expiresIn: '1h' }
);

console.log(token);