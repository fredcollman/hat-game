const Signup = ({ socket }) => {
  const handleSubmit = (e) => {
    e.preventDefault();
    console.log(e);
    socket.emit("SET_USERNAME", { username: e.target["username"].value });
  };
  return (
    <div className="center-text">
      <h2>Let's get started!</h2>
      <form className="flex flex-column flex-center" onSubmit={handleSubmit}>
        <label className="">
          <div>Please enter your name</div>
          <input
            required
            type="text"
            name="username"
            placeholder="e.g. susan"
          />
        </label>
        <button type="submit" className="max-width-s">
          Continue
        </button>
      </form>
    </div>
  );
};

export default Signup;
