import BasicForm from "./BasicForm";

const Signup = ({ socket, setUsername }) => {
  const handleSubmit = (e) => {
    console.log(e);
    setUsername(e.target["username"].value);
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
