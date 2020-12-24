const GroupInfo = ({ groupID }) => {
  return (
    <aside>
      <h2>This Group</h2>
      6-letter Group ID:{" "}
      <code>
        <strong>{groupID}</strong>
      </code>
    </aside>
  );
};

export default GroupInfo;
