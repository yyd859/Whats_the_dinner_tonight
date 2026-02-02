exports.handler = async (event) => {
    return {
        statusCode: 200,
        headers: {
            'Content-Type': 'text/plain',
            'Access-Control-Allow-Origin': '*'
        },
        body: 'Dinner Match Serverless Backend is Running'
    };
};
