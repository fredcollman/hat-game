import BasicForm from "./BasicForm";

const Signup = ({ socket, setUsername }) => {
  const handleSubmit = (e) => {
    console.log(e);
    const username = e.target["username"].value;
    if (username && username.length) {
      setUsername(username);
    }
  };
  return (
    <section className="center-text">
      <h2>Let's get started!</h2>
      <BasicForm
        onSubmit={handleSubmit}
        labelText="Please enter your name"
        fieldName="username"
        placeholder="e.g. susan"
        buttonText="Continue"
      />
    </section>
  );
};

export default Signup;
