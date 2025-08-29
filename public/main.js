const socket = io();

// عناصر DOM
const messageContainer = document.getElementById('messages');
const messageInput = document.getElementById('input');
const form = document.getElementById('composer');

// اسم المستخدم (قابل للتغيير)
let userName = "You"; 

// صوت الرسالة
const messageTone = new Audio('/message-tone.mp3');

// إرسال رسالة
form.addEventListener('submit', (e) => {
  e.preventDefault();
  sendMessage();
});

function sendMessage() {
  const text = messageInput.value.trim();
  if (!text) return;

  const data = {
    senderId: socket.id,
    name: userName,
    message: text,
    dateTime: new Date(),
  };

  // فقط إرسال للسيرفر، لا تضيفها UI هنا
  socket.emit('message', data);
  messageInput.value = '';
}

// استقبال الرسائل من السيرفر
socket.on('chat-message', (data) => {
  const isOwnMessage = data.senderId === socket.id;
  if (!isOwnMessage) messageTone.play();
  addMessageToUI(isOwnMessage, data);
});

// إضافة الرسالة للواجهة
function addMessageToUI(isOwnMessage, data) {
  clearFeedback();

  const avatarText = data.name.split(' ').map(n => n[0]).join('');

  const wrap = document.createElement('div');
  wrap.className = 'msg ' + (isOwnMessage ? 'me' : 'other');
  wrap.innerHTML = `
    ${!isOwnMessage ? `<div class="avatar">${avatarText}</div>` : ''}
    <div>
      <div class="bubble ${isOwnMessage ? 'out' : 'in'}">${data.message}</div>
      <div class="from" style="text-align:${isOwnMessage ? 'right' : 'left'}">
        ${data.name} • ${new Date(data.dateTime).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}
      </div>
    </div>
    ${isOwnMessage ? `<div class="avatar">${avatarText}</div>` : ''}
  `;
  messageContainer.appendChild(wrap);
  scrollToBottom();
}

// تمرير الرسائل للآخر تلقائياً
function scrollToBottom() {
  messageContainer.scrollTop = messageContainer.scrollHeight;
}

// Feedback عند الكتابة
messageInput.addEventListener('focus', emitFeedback);
messageInput.addEventListener('keypress', emitFeedback);
messageInput.addEventListener('blur', () => {
  socket.emit('feedback', { feedback: '' });
});

function emitFeedback() {
  socket.emit('feedback', { feedback: `✍️ ${userName} is typing a message` });
}

socket.on('feedback', (data) => {
  clearFeedback();
  if (data.feedback) {
    const element = document.createElement('li');
    element.className = 'message-feedback';
    element.innerHTML = `<p class="feedback">${data.feedback}</p>`;
    messageContainer.appendChild(element);
  }
});

// إزالة feedback القديم
function clearFeedback() {
  document.querySelectorAll('li.message-feedback').forEach(el => el.remove());
}
