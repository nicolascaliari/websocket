

const username = localStorage.getItem('name');
if (!username) {
  window.location.replace('/');
  throw new Error('Username is required');
}


const socket = io({
  auth: {
    token: '123456789',
    name: username
  }
});

const userUlElement = document.querySelector('ul');
const form = document.querySelector('form');
const input = document.querySelector('input');
const chatElement = document.querySelector('#chat');


const lblStatusOnline = document.querySelector('#status-online');
const lblStatusOffline = document.querySelector('#status-offline');



const renderUser = (user) => {

  userUlElement.innerHTML = '';
  user.forEach(user => {
    const li = document.createElement('li');
    li.innerHTML = user.name;
    userUlElement.appendChild(li);
  })
}


const renderMessage = (payload) => {
  const  { userId , message, name} = payload;


  console.log(userId, message, name)
  const divElement = document.createElement('div');

  divElement.classList.add('message');

  if(userId !== socket.id) {
    divElement.classList.add('incoming');
  }

  divElement.innerHTML = `
    <small> ${name} </small>
    <p class="text">${message}</p>`;

    chatElement.appendChild(divElement);

    chatElement.scrollTop = chatElement.scrollHeight;
}

form.addEventListener('submit', (e) => {
  e.preventDefault();

  const message = input.value
  input.value = '';

  socket.emit('send-message', message);
})




socket.on('connect', () => {
  lblStatusOnline.style.display = '';
  lblStatusOffline.style.display = 'none';
})


socket.on('disconnect', () => {
  lblStatusOnline.style.display = 'none';
  lblStatusOffline.style.display = '';
})


socket.on('clients', (clients) => {
  renderUser(clients);
})


socket.on('on-message' , payload => {
  renderMessage(payload);
})


