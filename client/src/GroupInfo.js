import { isThisPlayer } from "./utils";

const GroupInfo = ({ state }) => {
  const { groupID, teams } = state;
  return (
    <aside className="stack-m">
      <h2>This Group</h2>
      <span>
        6-letter Group ID:{" "}
        <code>
          <strong>{groupID}</strong>
        </code>
      </span>
      <div className="flex flex-wrap space-around gap-m">
        {teams.map((t) => {
          return (
            <div key={t.name}>
              <h3>{t.name}</h3>
              <ol>
                {t.members.map((u) => {
                  return (
                    <li key={u.clientID}>
                      {isThisPlayer(state, u)
                        ? (
                          <strong>{u.username} (you)</strong>
                        )
                        : (
                          u.username
                        )}
                    </li>
                  );
                })}
              </ol>
            </div>
          );
        })}
      </div>
    </aside>
  );
};

export default GroupInfo;
