const express = require("express");
const http = require("http");
const socketio = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = socketio(server);

app.use(express.static("public"));

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
const users = {}; // Dùng để lưu trữ người dùng và phòng chat của họ
const rooms = {}; // Dùng để lưu trữ thông tin phòng chat

// Hàm để lấy danh sách người dùng trong một phòng
function getUsersInRoom(room) {
  const roomUsers = [];
  for (const userId in users) {
    if (users[userId].room === room) {
      roomUsers.push(users[userId].username);
    }
  }
  return roomUsers;
}

io.on("connection", (socket) => {
  // Khi người dùng tham gia phòng chat
  socket.on("joinRoom", ({ username, room }) => {
    // Lưu thông tin người dùng
    users[socket.id] = { username, room };

    // Cho người dùng tham gia phòng chat
    socket.join(room);

    // Gửi tin nhắn chào mừng chỉ đến người dùng mới
    socket.emit("message", {
      username: "Hệ thống",
      text: "Chào mừng đến với ứng dụng chat!",
      time: "Bây giờ",
    });

    // Thông báo cho mọi người trong phòng
    socket.broadcast.to(room).emit("message", {
      username: "Hệ thống",
      text: `${username} đã tham gia phòng chat.`,
      time: new Date().toLocaleTimeString(),
    });

    // Cập nhật danh sách người dùng trong phòng
    io.to(room).emit("roomUsers", {
      room: room,
      users: getUsersInRoom(room),
    });
  });

  // Lắng nghe tin nhắn từ client
  socket.on("chatMessage", (msg) => {
    const user = users[socket.id];
    if (user) {
      io.to(user.room).emit("message", {
        username: user.username,
        text: msg,
        time: new Date().toLocaleTimeString(),
      });
    }
  });

  // Khi người dùng ngắt kết nối
  socket.on("disconnect", () => {
    const user = users[socket.id];
    if (user) {
      delete users[socket.id];

      // Thông báo cho mọi người trong phòng
      io.to(user.room).emit("message", {
        username: "Hệ thống",
        text: `${user.username} đã rời khỏi phòng chat.`,
        time: "Bây giờ",
      });

      // Cập nhật danh sách người dùng
      io.to(user.room).emit("roomUsers", {
        room: user.room,
        users: getUsersInRoom(user.room),
      });
    }
  });
});

server.listen(PORT, () => console.log(`Server đang chạy trên cổng ${PORT}`));
