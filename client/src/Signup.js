const Signup = ({ socket }) => {
  const handleSubmit = (e) => {
    e.preventDefault();
    console.log(e);
    socket.emit("SET_USERNAME", { username: e.target["username"].value });
  };
  return (
    <form onSubmit={handleSubmit}>
      <label>
        Please enter <em>your</em> name
        <input required type="text" name="username" placeholder="e.g. adele" />
      </label>
      <button type="submit">Continue</button>
    </form>
  );
};

export default Signup;
