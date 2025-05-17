const { getDocClient } = require('../utils/dbClient');
const docClient = getDocClient();
const verifyToken = require('../utils/verifyToken');
const validateSQL = require('../utils/validateSQL');

module.exports.handler = async (event) => {
  try {
    // ✅ Middleware-style checks inside the handler
    const user = verifyToken(event);
    validateSQL(event);

    const bookId = event.pathParameters?.id;

    const params = {
      TableName: process.env.DYNAMO_TABLE,
      Key: {
        id: bookId
      }
    };

    const result = await docClient.get(params).promise();

    if (!result.Item) {
      return {
        statusCode: 404,
        body: JSON.stringify({ error: 'Book not found' })
      };
    }

    return {
      statusCode: 200,
      body: JSON.stringify(result.Item)
    };
  } catch (err) {
    return {
      statusCode: err.statusCode || 500,
      body: JSON.stringify({
        error: err.message || 'Internal server error',
        details: err.details || null
      })
    };
  }
};