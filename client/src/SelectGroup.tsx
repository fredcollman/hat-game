import { FormEvent } from "react";
import BasicForm from "./BasicForm";
import useSender from "./useSender";

const SelectGroup = () => {
  const startGroup = useSender("START_GROUP");
  const joinGroup = useSender("JOIN_GROUP");
  const handleSubmit = (e: FormEvent) => {
    const form = e.target as HTMLFormElement;
    joinGroup({ groupID: form["groupID"].value.toUpperCase() });
  };
  return (
    <div className="center-text">
      <section>
        <h2>Join an existing group</h2>
        <BasicForm
          onSubmit={handleSubmit}
          labelText="6-letter Group ID"
          fieldName="groupID"
          placeholder="e.g. ABCXYZ"
          buttonText="Join"
        />
      </section>
      <section>
        <h2>Start a new group</h2>
        <button type="button" onClick={() => startGroup()}>
          Start
        </button>
      </section>
    </div>
  );
};

export default SelectGroup;
