const { getDocClient } = require('../utils/dbClient');
const docClient = getDocClient();
const { v4: uuidv4 } = require('uuid');
const verifyToken = require('../utils/verifyToken');
const validateBook = require('../utils/validateBook');
const validateSQL = require('../utils/validateSQL');

module.exports.handler = async (event) => {
  try {
    console.log("🚀 RAW event.body:", event.body);
    console.log("🚀 JWT:", event.headers?.authorization || event.headers?.Authorization);

    const user = verifyToken(event);

    // ✅ PARSE BODY FIRST
    const parsedBody = typeof event.body === "string"
      ? JSON.parse(event.body)
      : event.body;
    console.log("✅ Parsed body:", parsedBody);

    // ✅ Now pass parsedBody where needed
    validateSQL(event, parsedBody);
    validateBook(parsedBody);

    const { title, author, published_date, genre } = parsedBody;

    // Check if the book already exists
    const scanParams = {
      TableName: process.env.DYNAMO_TABLE,
      FilterExpression: '#title = :title',
      ExpressionAttributeNames: {
        '#title': 'title',
      },
      ExpressionAttributeValues: {
        ':title': title,
      },
    };

    const existing = await docClient.scan(scanParams).promise();

    if (existing.Items && existing.Items.length > 0) {
      return {
        statusCode: 409,
        body: JSON.stringify({
          error: {
            code: 409,
            message: 'Conflict',
            details: 'Book already exists',
          },
        }),
      };
    }

    const newBook = {
      id: uuidv4(),
      title,
      author,
      published_date,
      genre,
      created_at: new Date().toISOString(),
    };

    const putParams = {
      TableName: process.env.DYNAMO_TABLE,
      Item: newBook,
    };

    await docClient.put(putParams).promise();

    return {
      statusCode: 201,
      body: JSON.stringify(newBook),
    };
  } catch (err) {
    console.error("🔥 Error caught in handler:", err);
    return {
      statusCode: err.statusCode || 500,
      body: JSON.stringify({
        error: err.message || 'Internal server error',
        details: err.details || null,
      }),
    };
  }
};