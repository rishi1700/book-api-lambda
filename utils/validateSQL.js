module.exports = (event, parsedBody = {}) => {
  const sqlInjectionPattern =
    /(\b(SELECT|INSERT|DELETE|UPDATE|DROP|UNION|WHERE|OR|AND|;|--|\/\*|\*\/|\*|=|\(|\))\b)/gi;

  const queryParams = event.queryStringParameters || {};
  const pathParams = event.pathParameters || {};

  // ✅ Validate body
  for (const key in parsedBody) {
    if (
      typeof parsedBody[key] === "string" &&
      sqlInjectionPattern.test(parsedBody[key])
    ) {
      throw {
        statusCode: 400,
        message: `SQL Injection detected in body: ${key}`
      };
    }
  }

  // ✅ Validate query params
  for (const key in queryParams) {
    if (
      typeof queryParams[key] === "string" &&
      sqlInjectionPattern.test(queryParams[key])
    ) {
      throw {
        statusCode: 400,
        message: `SQL Injection detected in query: ${key}`
      };
    }
  }

  // ✅ Validate path params
  for (const key in pathParams) {
    if (
      typeof pathParams[key] === "string" &&
      sqlInjectionPattern.test(pathParams[key])
    ) {
      throw {
        statusCode: 400,
        message: `SQL Injection detected in path: ${key}`
      };
    }
  }
};