import { isThisPlayer } from "./utils";

const UserList = ({ state }) => {
  const { users } = state;
  return (
    <section>
      <h2>Players</h2>
      <ul className="flex gap-m">
        {users.map((u) => (
          <li key={u.clientID} className="padding-m bg-light">
            {isThisPlayer(state, u)
              ? (
                <strong>{u.username} (you)</strong>
              )
              : (
                u.username
              )}
          </li>
        ))}
      </ul>
    </section>
  );
};

export default UserList;
