let username = "anon";
let suggestions = [];
let clientID;

let ws;

let userList;
let userInfo;
let suggestionList;
let suggestionInfo;

const sendMessage = (category, data) => {
  ws.send(JSON.stringify({ category, data }));
};

const switchPage = (el) => {
  document.querySelectorAll("[aria-current=page]").forEach((prev) =>
    prev.setAttribute("aria-current", false)
  );
  el.setAttribute("aria-current", "page");
};

const show = (el) => {
  el.classList.remove("hidden");
};

const hide = (el) => {
  el.classList.add("hidden");
};

const byID = (id) => {
  const found = document.getElementById(id);
  if (!found) {
    console.error("could not find", id);
  }
  return found;
};

const onSubmitUsername = (e) => {
  console.debug("starting onSubmitUsername");
  e.preventDefault();
  const submitted = e.target["username"].value;
  if (submitted && submitted.length) {
    username = submitted;
    sendMessage("NEW_USER", { username });
    switchPage(byID("suggestion-page"));
  }
  console.debug("finished onSubmitUsername");
};

const onSubmitSuggestion = (e) => {
  console.debug("starting onSubmitSuggestion");
  e.preventDefault();
  const suggestion = e.target["suggestion"].value;
  if (suggestion && suggestion.length) {
    suggestions.push(suggestion);
    sendMessage("ADD_SUGGESTION", { suggestion });
    e.target["suggestion"].value = "";
  }
  console.debug("finished onSubmitSuggestion");
};

const onClickStartGame = (e) => {
  sendMessage("START_GAME", {});
  e.target.disabled = true;
};

const onReceiveMessage = (e) => {
  const { category, data } = JSON.parse(e.data);
  console.debug({ category, data });
  const handler = handlers[category];
  if (handler) {
    return handler(data);
  }
  console.error("no handler for category", category);
};

const handleWelcome = (data) => {
  clientID = data.clientID;
  handleUserList(data);
};

const handleUserList = ({ users }) => {
  const userCountText = users.length === 1
    ? "There is one player"
    : `There are ${users.length} players`;
  const userInfoText =
    `You are <strong>${username}</strong>. ${userCountText}.`;
  userInfo.innerHTML = userInfoText;
  userList.innerHTML = users.map((user) => `<li>${user}</li>`).join("");
};

const handleSuggestionCount = ({ count }) => {
  const suggestionCountText = count === 1
    ? "There is one suggestion"
    : `There are ${count} total suggestions`;
  const suggestionInfoText = `${suggestionCountText}. Your suggestions:`;
  suggestionInfo.innerHTML = suggestionInfoText;
  suggestionList.innerHTML = suggestions.map((sugg) => `<li>${sugg}</li>`).join(
    "",
  );
};

const handleStarting = ({ describer }) => {
  switchPage(byID("playing-page"));
  if (describer.clientID === clientID) {
    byID("whose-turn").innerHTML = `
    <h3>It's your turn!</h3>
    <button type="button">Start</button>
    `;
  } else {
    byID("whose-turn").innerHTML = `
    <h3>It's ${describer.username}'s turn</h3>
    `;
  }
};

const handlers = {
  WELCOME: handleWelcome,
  USER_LIST: handleUserList,
  SUGGESTION_COUNT: handleSuggestionCount,
  STARTING: handleStarting,
};

const init = () => {
  console.log("starting init");
  userList = byID("user-list");
  userInfo = byID("user-info");
  suggestionList = byID("your-suggestions");
  suggestionInfo = byID("suggestion-info");
  ws = new WebSocket("ws://localhost:8000/ws");

  byID("username-form").addEventListener(
    "submit",
    onSubmitUsername,
  );
  byID("suggestion-form").addEventListener(
    "submit",
    onSubmitSuggestion,
  );
  byID("start-game-btn").addEventListener("click", onClickStartGame);
  ws.onmessage = onReceiveMessage;

  console.log("finishing init");
};

const quickStart = () => {
  sendMessage("NEW_USER", { username: `${Math.random()}` });
  sendMessage("ADD_SUGGESTION", { suggestion: "Britney Spears" });
  sendMessage("ADD_SUGGESTION", { suggestion: "Sherlock Holmes" });
  sendMessage("ADD_SUGGESTION", { suggestion: "Gregg Wallace" });
  sendMessage("START_GAME", {});
};

init();
