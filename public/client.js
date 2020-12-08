let username;
let ws;

const onSubmitUsername = (e) => {
  console.debug("starting onSubmitUsername");
  e.preventDefault();
  const submitted = e.target["username"].value;
  if (submitted && submitted.length) {
    username = submitted;
    ws.send(`New username ${username}`);
  }
};

const onReceiveMessage = (e) => {
  console.log(e);
};

const init = () => {
  console.log("starting init");
  const usernameForm = document.querySelector("#username");
  ws = new WebSocket("ws://localhost:8000/ws");

  usernameForm.addEventListener("submit", onSubmitUsername);
  ws.onmessage = onReceiveMessage;

  console.log("finishing init");
};

init();
