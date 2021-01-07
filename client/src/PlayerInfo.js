const PlayerInfo = ({ player }) => {
  const { username } = player;
  return (
    <aside>
      You are playing as <strong>{username}</strong>
    </aside>
  );
};

export default PlayerInfo;
