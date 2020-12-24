export const currentPlayer = (state) =>
  state.users.find((u) => u.clientID === state.clientID);

export const isThisPlayer = (state, player) =>
  player?.clientID === currentPlayer(state)?.clientID;
