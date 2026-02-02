const { getConnection, deleteConnection, getConnectionsByRoom, deleteRoom } = require('../lib/db');

exports.handler = async (event) => {
    const connectionId = event.requestContext.connectionId;

    console.log('Disconnecting:', connectionId);

    try {
        // Get connection info to find room
        const connection = await getConnection(connectionId);

        if (connection && connection.roomCode) {
            // Check if room is now empty
            const connections = await getConnectionsByRoom(connection.roomCode);
            if (connections.length <= 1) {
                // Last person leaving, delete room
                await deleteRoom(connection.roomCode);
                console.log('Room deleted:', connection.roomCode);
            }
        }

        // Delete connection
        await deleteConnection(connectionId);

        return {
            statusCode: 200,
            body: 'Disconnected'
        };
    } catch (error) {
        console.error('Disconnect error:', error);
        return {
            statusCode: 500,
            body: 'Failed to disconnect'
        };
    }
};
