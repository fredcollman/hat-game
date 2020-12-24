const SelectGroup = ({ actions }) => {
  const { startGroup, joinGroup } = actions;
  const handleSubmit = (e) => {
    e.preventDefault();
    joinGroup(e.target["groupID"].value);
  };
  return (
    <>
      Welcome to the hat game.
      <section>
        <h2>Join an existing group</h2>
        <form onSubmit={handleSubmit}>
          <label>
            Group ID
            <input type="text" name="groupID" placeholder="e.g. ABCXYZ" />
          </label>
          <button type="submit">Join</button>
        </form>
      </section>
      <section>
        <h2>Start a new group</h2>
        <button type="button" onClick={startGroup}>
          Start
        </button>
      </section>
    </>
  );
};

export default SelectGroup;
