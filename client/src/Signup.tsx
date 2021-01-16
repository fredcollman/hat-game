import { FormEvent } from "react";
import BasicForm from "./BasicForm";
import usePerform from "./usePerform";
import { addUser } from "./actions";

const Signup = () => {
  const perform = usePerform();
  const handleSubmit = (e: FormEvent) => {
    const form = e.target as HTMLFormElement;
    const username = form["username"].value;
    perform(addUser(username));
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
