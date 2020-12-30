import BasicForm from "./BasicForm";

const SelectGroup = ({ actions }) => {
  const { startGroup, joinGroup } = actions;
  const handleSubmit = (e) =>
    joinGroup(e.target["groupID"].value.toUpperCase());
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
        <button type="button" onClick={startGroup}>
          Start
        </button>
      </section>
    </div>
  );
};

export default SelectGroup;
