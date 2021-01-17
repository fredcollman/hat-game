import { FormEvent } from "react";
import BasicForm from "./BasicForm";
import { ChooseGroupPhase } from "./game";
import usePerform from "./usePerform";
import { joinGroup, startGroup } from "./actions";

interface Props {
  state: ChooseGroupPhase;
}

const SelectGroup = ({ state }: Props) => {
  const perform = usePerform();
  const { userID } = state;

  const handleClick = () => {
    perform(startGroup(userID));
  };

  const handleSubmit = (e: FormEvent) => {
    const form = e.target as HTMLFormElement;
    perform(joinGroup({ userID, groupID: form["groupID"].value }));
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
        <button type="button" onClick={handleClick}>
          Start
        </button>
      </section>
    </div>
  );
};

export default SelectGroup;
