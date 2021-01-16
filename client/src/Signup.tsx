import { FormEvent } from "react";
import { Socket } from "socket.io-client";
import BasicForm from "./BasicForm";
import useSocket from "./useSocket";

type Callback<Context, Result> = (ctx: Context) => Result;

interface PerformanceContext {
  socket: Socket;
}

const addUser = ({
  username,
}: {
  username: string;
}): Callback<PerformanceContext, void> =>
  ({ socket }) => {
    socket.send("SET_USERNAME", { username });
  };

const usePerform = <Result extends unknown>() => {
  const socket = useSocket();
  return (cb: Callback<PerformanceContext, Result>) =>
    socket ? cb({ socket }) : null;
};

const Signup = () => {
  const perform = usePerform();
  const handleSubmit = (e: FormEvent) => {
    console.log(e);
    const form = e.target as HTMLFormElement;
    const username = form["username"].value;
    if (username && username.length) {
      perform(addUser({ username }));
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
