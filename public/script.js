const app = document.querySelector('.app');
const sendBtn = document.getElementById('sendBtn');
const textarea = document.querySelector('.composer textarea');
const messages = document.getElementById("messages"); // استعمل id واحد

sendBtn.addEventListener('click', () => {
  const text = textarea.value.trim();
  if (!text) return;

  const msg = document.createElement('div');
  msg.classList.add('message', 'sent');
  msg.innerHTML = `<p>${text}</p><span class="time">${new Date().getHours()}:${String(new Date().getMinutes()).padStart(2,'0')}</span>`;
  
  messages.appendChild(msg);
  textarea.value = '';
  messages.scrollTop = messages.scrollHeight;
});

