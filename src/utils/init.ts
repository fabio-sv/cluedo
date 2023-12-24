import { characters, rooms, weapons } from "../data/index.ts";
import { CluedoAtom, Knowledge, Status } from "../types.ts";

const _init_knowledge = (): Knowledge => {
  const initAtoms = (array: string[]): CluedoAtom[] => {
    return array.map<CluedoAtom>((character) => ({
      name: character,
      status: Status.UNKNOWN,
    }));
  };

  return {
    characters: initAtoms(characters),
    weapons: initAtoms(weapons),
    rooms: initAtoms(rooms),
  };
};

export { _init_knowledge };
