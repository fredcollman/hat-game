import BasicForm from "./BasicForm";
import { setUsername } from "./username";

const NewPlayer = () => {
  const handleSubmit = (e) => {
    const username = e.target["username"].value;
    setUsername(username);
  };
  return (
    <section>
      <h2>Sign up</h2>
      <BasicForm
        onSubmit={handleSubmit}
        labelText="Please choose a username"
        fieldName="username"
        placeholder="e.g. susan"
        buttonText="Let's go"
      />
    </section>
  );
};

export default NewPlayer;
