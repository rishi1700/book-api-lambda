const { getDocClient } = require('../utils/dbClient');
const docClient = getDocClient();
const verifyToken = require('../utils/verifyToken');
const validateSQL = require('../utils/validateSQL');

module.exports.handler = async (event) => {
  try {
    // ✅ Validate auth and input
    const user = verifyToken(event);
    validateSQL(event);

    const id = event.pathParameters?.id;

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

    if (existing.Item.deleted_at) {
      return {
        statusCode: 409,
        body: JSON.stringify({ error: 'Book is already deleted' })
      };
    }

    const updateParams = {
      TableName: process.env.DYNAMO_TABLE,
      Key: { id },
      UpdateExpression: 'SET #deleted = :timestamp',
      ExpressionAttributeNames: {
        '#deleted': 'deleted_at'
      },
      ExpressionAttributeValues: {
        ':timestamp': new Date().toISOString()
      },
      ReturnValues: 'UPDATED_NEW'
    };

    await docClient.update(updateParams).promise();

    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Book soft deleted' })
    };
  } catch (err) {
    return {
      statusCode: err.statusCode || 500,
      body: JSON.stringify({ error: err.message || 'Internal error', details: err.details || null })
    };
  }
};