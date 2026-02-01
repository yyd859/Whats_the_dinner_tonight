const express = require('express');
const { createServer } = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const dishes = require('./data/dishes');

const app = express();
const httpServer = createServer(app);
const corsOrigin = process.env.CORS_ORIGIN || "http://localhost:5173";
const io = new Server(httpServer, {
  cors: {
    origin: corsOrigin, // Vite 默认端口
    methods: ["GET", "POST"]
  }
});

app.use(cors({ origin: corsOrigin }));
app.use(express.json());

// 存储房间和用户数据
const rooms = new Map();

// 生成随机房间码
function generateRoomCode() {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

// Fisher-Yates 洗牌算法，随机打乱菜品顺序
function shuffleDishes(array) {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

// 获取菜品列表
app.get('/api/dishes', (req, res) => {
  res.json(dishes);
});

// Socket.IO 连接处理
io.on('connection', (socket) => {
  console.log('用户连接:', socket.id);

  // 创建房间
  socket.on('create-room', (callback) => {
    const roomCode = generateRoomCode();
    const room = {
      code: roomCode,
      users: [{
        id: socket.id,
        likes: new Set()
      }],
      matches: [],
      dishes: shuffleDishes(dishes) // 随机打乱菜品顺序
    };

    rooms.set(roomCode, room);
    socket.join(roomCode);

    console.log(`房间创建: ${roomCode}, 用户: ${socket.id}`);

    callback({
      success: true,
      roomCode,
      dishes: room.dishes
    });
  });

  // 加入房间
  socket.on('join-room', ({ roomCode }, callback) => {
    const room = rooms.get(roomCode);

    if (!room) {
      callback({ success: false, message: '房间不存在' });
      return;
    }

    if (room.users.length >= 2) {
      callback({ success: false, message: '房间已满' });
      return;
    }

    room.users.push({
      id: socket.id,
      likes: new Set()
    });

    socket.join(roomCode);

    console.log(`用户加入房间: ${roomCode}, 用户: ${socket.id}`);

    // 通知房间内的其他用户
    socket.to(roomCode).emit('user-joined');

    callback({
      success: true,
      roomCode,
      dishes: room.dishes,
      userCount: room.users.length
    });
  });

  // 处理滑动（喜欢/不喜欢）
  socket.on('swipe', ({ roomCode, dishId, liked }) => {
    const room = rooms.get(roomCode);

    if (!room) {
      console.log('房间不存在:', roomCode);
      return;
    }

    const user = room.users.find(u => u.id === socket.id);
    if (!user) {
      console.log('用户不在房间中:', socket.id);
      return;
    }

    if (liked) {
      user.likes.add(dishId);

      // 检查是否匹配
      const otherUser = room.users.find(u => u.id !== socket.id);
      if (otherUser && otherUser.likes.has(dishId)) {
        // 匹配成功！
        const matchedDish = dishes.find(d => d.id === dishId);
        room.matches.push(matchedDish);

        console.log(`匹配成功! 房间: ${roomCode}, 菜品: ${matchedDish.name}`);

        // 通知房间内所有用户
        io.to(roomCode).emit('match-found', {
          dish: matchedDish,
          totalMatches: room.matches.length
        });
      }
    }
  });

  // 获取当前匹配列表
  socket.on('get-matches', ({ roomCode }, callback) => {
    const room = rooms.get(roomCode);

    if (room) {
      callback({ matches: room.matches });
    } else {
      callback({ matches: [] });
    }
  });

  // 重置房间
  socket.on('reset-room', ({ roomCode }) => {
    const room = rooms.get(roomCode);

    if (room) {
      // 重置所有用户的喜欢列表
      room.users.forEach(user => user.likes.clear());
      room.matches = [];
      // 重新打乱菜品顺序
      room.dishes = shuffleDishes(dishes);

      // 通知所有用户重置，并发送新的菜品顺序
      io.to(roomCode).emit('room-reset', { dishes: room.dishes });

      console.log(`房间重置: ${roomCode}`);
    }
  });

  // 断开连接
  socket.on('disconnect', () => {
    console.log('用户断开连接:', socket.id);

    // 从所有房间中移除该用户
    rooms.forEach((room, roomCode) => {
      const userIndex = room.users.findIndex(u => u.id === socket.id);
      if (userIndex !== -1) {
        room.users.splice(userIndex, 1);

        // 通知房间内其他用户
        socket.to(roomCode).emit('user-left');

        // 如果房间空了，删除房间
        if (room.users.length === 0) {
          rooms.delete(roomCode);
          console.log(`房间删除: ${roomCode}`);
        }
      }
    });
  });
});

const PORT = process.env.PORT || 3000;

httpServer.listen(PORT, () => {
  console.log(`服务器运行在 http://localhost:${PORT}`);
});
