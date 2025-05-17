const { getDocClient } = require('../utils/dbClient');
const docClient = getDocClient();
const verifyToken = require('../utils/verifyToken');
const validateBook = require('../utils/validateBook');
const validateSQL = require('../utils/validateSQL');

module.exports.handler = async (event) => {
  try {
    // ✅ Run middleware logic inside the handler
    const user = verifyToken(event);
    validateSQL(event);

    const { id } = event.pathParameters || {};
    const body = JSON.parse(event.body);
    validateBook(body); // Validates title, author, published_date, genre

    const { title, author, published_date, genre } = body;

    // Step 1: Check if the book exists
    const getParams = {
      TableName: process.env.DYNAMO_TABLE,
      Key: { id }
    };

    const existing = await docClient.get(getParams).promise();

    if (!existing.Item) {
      return {
        statusCode: 404,
        body: JSON.stringify({ error: 'Book not found' })
      };
    }

    // Step 2: Update the book
    const updateParams = {
      TableName: process.env.DYNAMO_TABLE,
      Key: { id },
      UpdateExpression: 'SET #title = :title, #author = :author, #date = :date, #genre = :genre',
      ExpressionAttributeNames: {
        '#title': 'title',
        '#author': 'author',
        '#date': 'published_date',
        '#genre': 'genre'
      },
      ExpressionAttributeValues: {
        ':title': title,
        ':author': author,
        ':date': published_date,
        ':genre': genre
      },
      ReturnValues: 'ALL_NEW'
    };

    const result = await docClient.update(updateParams).promise();

    return {
      statusCode: 200,
      body: JSON.stringify(result.Attributes)
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