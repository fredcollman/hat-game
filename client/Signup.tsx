import { React, useState } from "./deps.tsx";

const Signup = () => {
  const [username, setUsername] = useState();

  const handleSubmit = (e: React.SyntheticEvent) => {
    e.preventDefault();
    console.log(e);
  };
  return <section>
    <h2>Join the game</h2>
    <form onSubmit={handleSubmit}>
      <label>
        Please enter <em>your</em> name
        <input required type="text" name="username" placeholder="e.g. adele" />
      </label>
      <button type="submit">Continue</button>
    </form>
  </section>;
};

export default Signup;
