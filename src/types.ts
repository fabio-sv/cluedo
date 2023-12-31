export interface IGame {
  solution: CluedoSet;
  cardsPerHand: number;
  players: Player[];
  table: string[];
  round: number;
  winner: number | undefined;
  answers: Answer[];
  deck: {
    characters: string[];
    weapons: string[];
    rooms: string[];
  };
}

export type Player = {
  idx: number;
  name: string;
  cards: string[];
  knowledge: Knowledge;
};

export type Knowledge = {
  characters: CluedoAtom[]; // characters known and not known
  weapons: CluedoAtom[];
  rooms: CluedoAtom[];
};

export enum Status {
  FOUND = "found",
  SOLUTION = "solution",
  UNKNOWN = "unknown",
}

export type CluedoAtom = {
  name: string;
  location?: number;
  status: Status;
};

export type Answer = {
  interrogator: number; // who asked
  responder?: number; // who answered (nullable)
  set: CluedoSet; // what they asked for
};

export type CluedoSet = {
  character: string;
  weapon: string;
  room: string;
};

export type Outcome = {
  player: Player;
  guess: CluedoSet;
  solution: CluedoSet;
  rounds: number;
  roundsPBW: number;
};
