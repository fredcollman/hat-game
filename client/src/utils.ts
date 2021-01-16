import { Describer, GroupState, User } from "./game";

export interface Message {
  type: string;
  data: any;
}

export const currentPlayer = (state: GroupState) =>
  state.users.find((u) => u.clientID === state.clientID);

export const isThisPlayer = (
  state: GroupState,
  player: User | Describer | null,
) => player && player?.clientID === currentPlayer(state)?.clientID;

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
