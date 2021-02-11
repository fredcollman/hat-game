import { gql } from "@apollo/client";

export const GAME_DETAILS = gql`
  fragment GameDetails on Game {
    round
    teams {
      name
      members {
        id
        username
      }
    }
    users {
      username
    }
    options {
      turnDurationSeconds
    }
    suggestions {
      count
    }
  }
`;

export interface GameDetails {
  round: number;
  teams: {
    name: string;
    members: {
      id: string;
      username: string;
    }[];
  }[];
  options: { turnDurationSeconds: number };
  suggestions: { count: number };
}

export interface GroupDetails {
  id: string;
  game: GameDetails;
}

export const TURN_DETAILS = gql`
  fragment TurnDetails on Turn {
    round
    duration
    describer {
      id
      username
      team
    }
  }
`;

export interface TurnDetails {
  round: number;
  duration: number;
  describer: {
    id: string;
    username: string;
    team: string;
  };
}
