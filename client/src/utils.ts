import { State, User } from "./game";

export const currentPlayer = (state: State) =>
  state.users.find((u) => u.clientID === state.clientID);

export const isThisPlayer = (state: State, player: User | null) =>
  player && player?.clientID === currentPlayer(state)?.clientID;

export const isThisTeam = (state: State, teamName: string) => {
  const team = state.teams.find((t) => t.name === teamName);
  return !!team && team.members.some((m) => isThisPlayer(state, m));
};

export const pluralise = (count: number, word: string) =>
  count === 1 ? word : `${word}s`;

export const assertNever = (value: never): never => {
  throw new Error(
    `Unhandled discriminating union member: ${JSON.stringify(value)}`,
  );
};
