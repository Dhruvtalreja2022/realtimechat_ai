const chatForm = document.getElementById('chat-form');
const chatMessages = document.querySelector('.chat-messages');
const socket = io();
const roomName = document.getElementById('room-name');
const userList = document.getElementById('users');

// Get username and room number from the URL query
const { username, room } = Qs.parse(location.search, {
  ignoreQueryPrefix: true
});

// Join the chat room
socket.emit('joinRoom', { username, room });

// Listen for room data (room name and user list) from the server
socket.on('roomData', ({ room, users }) => {
  outputRoomName(room);
  outputUsers(users);
});

// Message from the server
socket.on('message', (message) => {
  console.log(message);  // Debugging
  outputMessage(message);

  // Scroll to the latest message
  chatMessages.scrollTop = chatMessages.scrollHeight;
});

// Message submit event
chatForm.addEventListener('submit', (e) => {
  e.preventDefault();

  // Get message text
  const msg = e.target.elements.msg.value.trim();

  // Validate message
  if (!msg) {
    return;  // Prevent emitting empty messages
  }

  // Emit message to the server
  socket.emit('chatMessage', msg);

  // Clear input field
  e.target.elements.msg.value = '';
  e.target.elements.msg.focus();
});

// Output message to the DOM
function outputMessage(message) {
  const div = document.createElement('div');
  div.classList.add('message');
  div.innerHTML = `
    <p class="meta">${message.username} <span>${message.time}</span></p>
    <p class="text">${message.text}</p>
  `;
  document.querySelector('.chat-messages').appendChild(div);
}

// Add room name to the DOM
function outputRoomName(room) {
  roomName.innerText = room;
}

// Add users to the DOM
function outputUsers(users) {
  userList.innerHTML = `
    ${users.map(user => `<li>${user.username}</li>`).join('')}
  `;
}
