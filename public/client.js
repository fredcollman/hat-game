let username;

const onSubmitUsername = (e) => {
  console.debug("starting onSubmitUsername");
  e.preventDefault();
  const submitted = e.target["username"].value;
  if (submitted && submitted.length) {
    username = submitted;
  }
};

const init = () => {
  console.log("starting init");
  const usernameForm = document.querySelector("#username");

  usernameForm.addEventListener("submit", onSubmitUsername);

  console.log("finishing init");
};

init();
