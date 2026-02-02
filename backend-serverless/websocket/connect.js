const { saveConnection } = require('../lib/db');

exports.handler = async (event) => {
    const connectionId = event.requestContext.connectionId;

    console.log('New connection:', connectionId);

    try {
        await saveConnection(connectionId);

        return {
            statusCode: 200,
            body: 'Connected'
        };
    } catch (error) {
        console.error('Connection error:', error);
        return {
            statusCode: 500,
            body: 'Failed to connect'
        };
    }
};
