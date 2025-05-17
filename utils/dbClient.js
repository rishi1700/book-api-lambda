let docClient;

module.exports = {
  getDocClient: () => {
    if (!docClient) {
      const AWS = require('aws-sdk'); // ✅ runtime-only import
      docClient = new AWS.DynamoDB.DocumentClient();
    }
    return docClient;
  }
};