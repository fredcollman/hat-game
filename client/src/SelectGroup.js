import BasicForm from "./BasicForm";
import usePlayer from "./usePlayer";

const SelectGroup = ({ actions }) => {
  const { player } = usePlayer();
  const { startGroup, joinGroup } = actions;
  const handleJoin = (e) =>
    joinGroup({
      groupID: e.target["groupID"].value.toUpperCase(),
      player,
    });
  const handleStart = () => startGroup({ player });

  if (!player) {
    // TODO add error boundary
    throw new Error("player is logged out");
  }
  return (
    <div className="center-text">
      <section>
        <h2>Join an existing group</h2>
        <BasicForm
          onSubmit={handleJoin}
          labelText="6-letter Group ID"
          fieldName="groupID"
          placeholder="e.g. ABCXYZ"
          buttonText="Join"
        />
      </section>
      <section>
        <h2>Start a new group</h2>
        <button type="button" onClick={handleStart}>
          Start
        </button>
      </section>
    </div>
  );
};

export default SelectGroup;
