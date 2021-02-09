import { gql } from "@apollo/client";

export const GAME_DETAILS = gql`
  fragment GameDetails on Game {
    round
    teams {
      name
      members {
        username
      }
    }
    users {
      id
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
