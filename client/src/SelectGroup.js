const SelectGroup = ({ startGroup }) => (
  <>
    Welcome to the hat game.
    <section>
      <h2>Join an existing group</h2>
      <label>
        Lobby ID
        <input type="text" placeholder="e.g. ABCXYZ" />
      </label>
    </section>
    <section>
      <h2>Start a new group</h2>
      <button type="button" onClick={startGroup}>
        Start
      </button>
    </section>
  </>
);

export default SelectGroup;
