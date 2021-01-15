import { FormEvent } from "react";
import BasicForm from "./BasicForm";

interface Props {
  setUsername: ({ username }: { username: string }) => void;
}

const Signup = ({ setUsername }: Props) => {
  const handleSubmit = (e: FormEvent) => {
    console.log(e);
    const form = e.target as HTMLFormElement;
    const username = form["username"].value;
    if (username && username.length) {
      setUsername({ username });
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
