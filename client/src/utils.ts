import { GroupState, User } from "./game";

export interface Message {
  type: string;
  data: any;
}

export const currentPlayer = (state: GroupState) =>
  state.users.find((u) => u.id === state.userID);

export const isThisPlayer = (state: GroupState, player: User | null) =>
  player && player?.id === currentPlayer(state)?.id;

export const isThisTeam = (state: GroupState, teamName: string) => {
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
