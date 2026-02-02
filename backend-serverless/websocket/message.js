const {
    getConnection,
    updateConnectionRoom,
    createRoom,
    getRoom,
    updateRoom,
    sendToConnection,
    broadcastToRoom,
    generateRoomCode,
    shuffleArray,
    getConnectionsByRoom
} = require('../lib/db');
const dishes = require('../lib/dishes');

exports.handler = async (event) => {
    const connectionId = event.requestContext.connectionId;
    const domain = event.requestContext.domainName;
    const stage = event.requestContext.stage;
    const endpoint = `https://${domain}/${stage}`;

    let body;
    try {
        body = JSON.parse(event.body);
    } catch (error) {
        console.error('Invalid JSON:', error);
        return { statusCode: 400, body: 'Invalid JSON' };
    }

    const { action, data } = body;

    console.log('Message received:', { connectionId, action, data });

    try {
        switch (action) {
            case 'create-room':
                return await handleCreateRoom(connectionId, endpoint);

            case 'join-room':
                return await handleJoinRoom(connectionId, endpoint, data);

            case 'swipe':
                return await handleSwipe(connectionId, endpoint, data);

            case 'get-matches':
                return await handleGetMatches(connectionId, endpoint, data);

            case 'reset-room':
                return await handleResetRoom(connectionId, endpoint, data);

            default:
                console.log('Unknown action:', action);
                return { statusCode: 400, body: 'Unknown action' };
        }
    } catch (error) {
        console.error('Handler error:', error);
        return { statusCode: 500, body: 'Internal server error' };
    }
};

async function handleCreateRoom(connectionId, endpoint) {
    const roomCode = generateRoomCode();
    const shuffledDishes = shuffleArray(dishes);

    // Create room in DynamoDB
    await createRoom(roomCode, shuffledDishes);

    // Update connection with room code
    await updateConnectionRoom(connectionId, roomCode);

    // Send response to creator
    await sendToConnection(endpoint, connectionId, {
        type: 'room-created',
        data: {
            success: true,
            roomCode,
            dishes: shuffledDishes
        }
    });

    return { statusCode: 200, body: 'Room created' };
}

async function handleJoinRoom(connectionId, endpoint, data) {
    const { roomCode } = data;

    // Get room
    const room = await getRoom(roomCode);

    if (!room) {
        await sendToConnection(endpoint, connectionId, {
            type: 'join-error',
            data: {
                success: false,
                message: '房间不存在'
            }
        });
        return { statusCode: 200, body: 'Room not found' };
    }

    // Check if room is full
    const connections = await getConnectionsByRoom(roomCode);
    if (connections.length >= 2) {
        await sendToConnection(endpoint, connectionId, {
            type: 'join-error',
            data: {
                success: false,
                message: '房间已满'
            }
        });
        return { statusCode: 200, body: 'Room full' };
    }

    // Update connection with room code
    await updateConnectionRoom(connectionId, roomCode);

    // Notify existing users
    await broadcastToRoom(endpoint, roomCode, {
        type: 'user-joined'
    }, connectionId);

    // Send response to joiner
    await sendToConnection(endpoint, connectionId, {
        type: 'room-joined',
        data: {
            success: true,
            roomCode,
            dishes: room.dishes,
            userCount: connections.length + 1
        }
    });

    return { statusCode: 200, body: 'Joined room' };
}

async function handleSwipe(connectionId, endpoint, data) {
    const { roomCode, dishId, liked } = data;

    const room = await getRoom(roomCode);

    if (!room) {
        console.log('Room not found:', roomCode);
        return { statusCode: 200, body: 'Room not found' };
    }

    // Initialize users array if not exists
    if (!room.users) {
        room.users = [];
    }

    // Find or create user
    let user = room.users.find(u => u.id === connectionId);
    if (!user) {
        user = { id: connectionId, likes: [] };
        room.users.push(user);
    }

    if (liked) {
        // Add to likes if not already there
        if (!user.likes.includes(dishId)) {
            user.likes.push(dishId);
        }

        // Check for match
        const otherUser = room.users.find(u => u.id !== connectionId);
        if (otherUser && otherUser.likes.includes(dishId)) {
            // Match found!
            const matchedDish = dishes.find(d => d.id === dishId);

            if (!room.matches) {
                room.matches = [];
            }
            room.matches.push(matchedDish);

            console.log('Match found!', { roomCode, dish: matchedDish.name });

            // Broadcast match to all users in room
            await broadcastToRoom(endpoint, roomCode, {
                type: 'match-found',
                data: {
                    dish: matchedDish,
                    totalMatches: room.matches.length
                }
            });
        }
    }

    // Update room in DynamoDB
    await updateRoom(roomCode, {
        users: room.users,
        matches: room.matches || []
    });

    return { statusCode: 200, body: 'Swipe processed' };
}

async function handleGetMatches(connectionId, endpoint, data) {
    const { roomCode } = data;

    const room = await getRoom(roomCode);

    await sendToConnection(endpoint, connectionId, {
        type: 'matches-list',
        data: {
            matches: room ? room.matches || [] : []
        }
    });

    return { statusCode: 200, body: 'Matches sent' };
}

async function handleResetRoom(connectionId, endpoint, data) {
    const { roomCode } = data;

    const room = await getRoom(roomCode);

    if (!room) {
        return { statusCode: 200, body: 'Room not found' };
    }

    // Reset room state
    const shuffledDishes = shuffleArray(dishes);
    await updateRoom(roomCode, {
        dishes: shuffledDishes,
        matches: [],
        users: []
    });

    // Notify all users
    await broadcastToRoom(endpoint, roomCode, {
        type: 'room-reset',
        data: {
            dishes: shuffledDishes
        }
    });

    console.log('Room reset:', roomCode);

    return { statusCode: 200, body: 'Room reset' };
}
