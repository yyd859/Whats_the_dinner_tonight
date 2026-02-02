const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, PutCommand, GetCommand, DeleteCommand, QueryCommand, UpdateCommand } = require('@aws-sdk/lib-dynamodb');
const { ApiGatewayManagementApiClient, PostToConnectionCommand, DeleteConnectionCommand } = require('@aws-sdk/client-apigatewaymanagementapi');

const client = new DynamoDBClient({});
const ddbDocClient = DynamoDBDocumentClient.from(client);

const CONNECTIONS_TABLE = process.env.CONNECTIONS_TABLE;
const ROOMS_TABLE = process.env.ROOMS_TABLE;

// DynamoDB operations
async function saveConnection(connectionId, roomCode = null) {
    await ddbDocClient.send(new PutCommand({
        TableName: CONNECTIONS_TABLE,
        Item: {
            connectionId,
            roomCode,
            connectedAt: Date.now()
        }
    }));
}

async function getConnection(connectionId) {
    const result = await ddbDocClient.send(new GetCommand({
        TableName: CONNECTIONS_TABLE,
        Key: { connectionId }
    }));
    return result.Item;
}

async function deleteConnection(connectionId) {
    await ddbDocClient.send(new DeleteCommand({
        TableName: CONNECTIONS_TABLE,
        Key: { connectionId }
    }));
}

async function getConnectionsByRoom(roomCode) {
    const result = await ddbDocClient.send(new QueryCommand({
        TableName: CONNECTIONS_TABLE,
        IndexName: 'roomCode-index',
        KeyConditionExpression: 'roomCode = :roomCode',
        ExpressionAttributeValues: {
            ':roomCode': roomCode
        }
    }));
    return result.Items || [];
}

async function updateConnectionRoom(connectionId, roomCode) {
    await ddbDocClient.send(new UpdateCommand({
        TableName: CONNECTIONS_TABLE,
        Key: { connectionId },
        UpdateExpression: 'SET roomCode = :roomCode',
        ExpressionAttributeValues: {
            ':roomCode': roomCode
        }
    }));
}

// Room operations
async function createRoom(roomCode, dishes) {
    const ttl = Math.floor(Date.now() / 1000) + (24 * 60 * 60); // 24 hours
    await ddbDocClient.send(new PutCommand({
        TableName: ROOMS_TABLE,
        Item: {
            roomCode,
            dishes,
            matches: [],
            users: [],
            createdAt: Date.now(),
            ttl
        }
    }));
}

async function getRoom(roomCode) {
    const result = await ddbDocClient.send(new GetCommand({
        TableName: ROOMS_TABLE,
        Key: { roomCode }
    }));
    return result.Item;
}

async function updateRoom(roomCode, updates) {
    const updateExpressions = [];
    const expressionAttributeValues = {};
    const expressionAttributeNames = {};

    Object.keys(updates).forEach((key, index) => {
        const placeholder = `:val${index}`;
        const namePlaceholder = `#attr${index}`;
        updateExpressions.push(`${namePlaceholder} = ${placeholder}`);
        expressionAttributeValues[placeholder] = updates[key];
        expressionAttributeNames[namePlaceholder] = key;
    });

    await ddbDocClient.send(new UpdateCommand({
        TableName: ROOMS_TABLE,
        Key: { roomCode },
        UpdateExpression: `SET ${updateExpressions.join(', ')}`,
        ExpressionAttributeValues: expressionAttributeValues,
        ExpressionAttributeNames: expressionAttributeNames
    }));
}

async function deleteRoom(roomCode) {
    await ddbDocClient.send(new DeleteCommand({
        TableName: ROOMS_TABLE,
        Key: { roomCode }
    }));
}

// WebSocket messaging
async function sendToConnection(endpoint, connectionId, data) {
    const apiGatewayClient = new ApiGatewayManagementApiClient({ endpoint });

    try {
        await apiGatewayClient.send(new PostToConnectionCommand({
            ConnectionId: connectionId,
            Data: JSON.stringify(data)
        }));
        return true;
    } catch (error) {
        if (error.statusCode === 410) {
            // Connection is gone, clean up
            await deleteConnection(connectionId);
            return false;
        }
        throw error;
    }
}

async function broadcastToRoom(endpoint, roomCode, data, excludeConnectionId = null) {
    const connections = await getConnectionsByRoom(roomCode);

    const sendPromises = connections
        .filter(conn => conn.connectionId !== excludeConnectionId)
        .map(conn => sendToConnection(endpoint, conn.connectionId, data));

    await Promise.all(sendPromises);
}

// Utility functions
function generateRoomCode() {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
}

function shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

module.exports = {
    saveConnection,
    getConnection,
    deleteConnection,
    getConnectionsByRoom,
    updateConnectionRoom,
    createRoom,
    getRoom,
    updateRoom,
    deleteRoom,
    sendToConnection,
    broadcastToRoom,
    generateRoomCode,
    shuffleArray
};
