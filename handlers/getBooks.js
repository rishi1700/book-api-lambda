const { getDocClient } = require('../utils/dbClient');
const docClient = getDocClient();
const verifyToken = require('../utils/verifyToken');
const validateSQL = require('../utils/validateSQL');

module.exports.handler = async (event) => {
  try {
    // ✅ Middleware-style validation
    const user = verifyToken(event);
    validateSQL(event);

    const {
      title,
      genre,
      sortBy = 'title',
      order = 'ASC',
      page = 1,
      limit = 5,
    } = event.queryStringParameters || {};

    const params = {
      TableName: process.env.DYNAMO_TABLE,
    };

    // Filters
    let filterExpressions = [];
    let expressionAttributeValues = {};
    let expressionAttributeNames = {};

    if (title) {
      filterExpressions.push('contains(#title, :title)');
      expressionAttributeValues[':title'] = title;
      expressionAttributeNames['#title'] = 'title';
    }

    if (genre) {
      filterExpressions.push('#genre = :genre');
      expressionAttributeValues[':genre'] = genre;
      expressionAttributeNames['#genre'] = 'genre';
    }

    if (filterExpressions.length > 0) {
      params.FilterExpression = filterExpressions.join(' AND ');
      params.ExpressionAttributeValues = expressionAttributeValues;
      params.ExpressionAttributeNames = expressionAttributeNames;
    }

    const data = await docClient.scan(params).promise();

    const items = data.Items || [];
    const offset = (parseInt(page) - 1) * parseInt(limit);
    const paginated = items.slice(offset, offset + parseInt(limit));

    return {
      statusCode: 200,
      body: JSON.stringify({
        totalBooks: items.length,
        totalPages: Math.ceil(items.length / limit),
        currentPage: parseInt(page),
        books: paginated,
      }),
    };
  } catch (err) {
    return {
      statusCode: err.statusCode || 500,
      body: JSON.stringify({
        error: err.message || 'Internal server error',
        details: err.details || null,
      }),
    };
  }
};