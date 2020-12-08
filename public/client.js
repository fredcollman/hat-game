let username;
let ws;
let userList;

const sendMessage = (category, data) => {
  ws.send(JSON.stringify({ category, data }));
};

const onSubmitUsername = (e) => {
  console.debug("starting onSubmitUsername");
  e.preventDefault();
  const submitted = e.target["username"].value;
  if (submitted && submitted.length) {
    username = submitted;
    sendMessage("NEW_USER", { username });
  }
};

const onReceiveMessage = (e) => {
  const { category, data } = JSON.parse(e.data);
  console.debug({ category, data });
  switch (category) {
    case "USER_LIST":
      return handleUserList(data);
    default:
      break;
  }
};

const handleUserList = ({ users }) => {
  userList.innerHTML = users.map((user) => `<li>${user}</li>`).join("");
};

const init = () => {
  console.log("starting init");
  const usernameForm = document.querySelector("#username");
  userList = document.querySelector("#users");
  ws = new WebSocket("ws://localhost:8000/ws");

  usernameForm.addEventListener("submit", onSubmitUsername);
  ws.onmessage = onReceiveMessage;

  console.log("finishing init");
};

init();
