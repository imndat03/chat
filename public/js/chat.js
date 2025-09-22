const chatForm = document.getElementById("chat-form");
const chatMessages = document.getElementById("chat-messages");
const messageInput = document.getElementById("msg");
const usersList = document.getElementById("users");
const roomNameDisplay = document.getElementById("room-name");
const chatRoomTitle = document.getElementById("chat-room-title"); // Thêm dòng này
const emojiButton = document.getElementById("emoji-btn");

const socket = io();

const { username, room } = Qs.parse(location.search, {
  ignoreQueryPrefix: true,
});

socket.emit("joinRoom", { username, room });

socket.on("message", (message) => {
  outputMessage(message);
  chatMessages.scrollTop = chatMessages.scrollHeight;
});

socket.on("roomUsers", ({ room, users }) => {
  outputRoomName(room);
  outputUsers(users);
});

chatForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const msg = messageInput.value.trim();
  if (msg !== "") {
    socket.emit("chatMessage", msg);
    messageInput.value = "";
    messageInput.focus();
  }
});

function outputMessage(message) {
  const div = document.createElement("div");
  div.classList.add("message");

  if (message.username === "Hệ thống") {
    div.classList.add("system");
    div.innerHTML = `<p>${message.text}</p>`;
  } else if (message.username === username) {
    div.classList.add("sent");
    div.innerHTML = `<p>${message.text}</p>`;
    const metaDiv = document.createElement("div");
    metaDiv.classList.add("message-meta");
    metaDiv.innerHTML = `<span>Bạn</span> lúc <span>${message.time}</span>`;
    div.prepend(metaDiv); // Đặt meta lên đầu tin nhắn
  } else {
    div.classList.add("received");
    const metaDiv = document.createElement("div");
    metaDiv.classList.add("message-meta");
    metaDiv.innerHTML = `<span>${message.username}</span> lúc <span>${message.time}</span>`;
    const textP = document.createElement("p");
    textP.textContent = message.text;
    div.appendChild(metaDiv);
    div.appendChild(textP);
  }

  chatMessages.appendChild(div);
}

function outputRoomName(room) {
  roomNameDisplay.innerText = room;
  chatRoomTitle.innerText = room; // Cập nhật tên phòng ở header chính
}

function outputUsers(users) {
  usersList.innerHTML = `
    ${users
      .map(
        (user) => `<li><i class="fas fa-circle online-status"></i> ${user}</li>`
      )
      .join("")}
  `;
}

emojiButton.addEventListener("click", () => {
  // Để tích hợp một trình chọn emoji hoàn chỉnh, bạn có thể sử dụng thư viện bên ngoài.
  // Ví dụ đơn giản này chỉ thêm một emoji ngẫu nhiên vào ô input.
  const emojis = ["😊", "😂", "👍", "❤️", "🔥", "🎉", "🌟", "🚀", "💯", "✨"];
  const randomEmoji = emojis[Math.floor(Math.random() * emojis.length)];
  messageInput.value += randomEmoji;
  messageInput.focus();
});
