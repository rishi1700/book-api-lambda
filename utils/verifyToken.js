const jwt = require("jsonwebtoken");

module.exports = (event) => {
  const authHeader = event.headers?.authorization || event.headers?.Authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw {
      statusCode: 401,
      message: "Unauthorized: Missing or invalid token"
    };
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return decoded;
  } catch (err) {
    const errorType = err.name === "TokenExpiredError"
      ? "Token expired"
      : "Unauthorized: Invalid token";
    throw {
      statusCode: 401,
      message: errorType,
      details: err.message
    };
  }
};