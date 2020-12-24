const UserList = ({ user, users }) => (
  <section>
    <h2>Players</h2>
    <ul className="flex gap-m">
      {users.map((u) => (
        <li key={u.clientID} className="padding-m bg-light">
          {u.clientID === user?.clientID
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

export default UserList;
