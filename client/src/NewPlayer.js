import BasicForm from "./BasicForm";
import usePlayer from "./usePlayer";

const NewPlayer = () => {
  const { setName } = usePlayer();
  const handleSubmit = (e) => {
    const username = e.target["username"].value;
    setName(username);
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
