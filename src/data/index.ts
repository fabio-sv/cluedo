import { _init_knowledge } from "../utils/init.ts";
import { Player } from "../types.ts";

const characters = ["Miss Scarlett", "Colonel Mustard", "Mrs. White", "Mr. Green", "Mrs. Peacock", "Professor Plum"];
const weapons = ["Candlestick", "Dagger", "Lead Pipe", "Revolver", "Rope", "Wrench"];
const rooms = ["Kitchen", "Ballroom", "Conservatory", "Dining Room", "Cellar", "Library", "Billiard Room", "Lounge", "Hall", "Study"];

const TABLE_IDX = 64;  // special idx for table

export const _playerNames = ["Daenerys", "Jon", "Aberforth", "Bellatrix"];
const players: Player[] = _playerNames.map<Player>((name, idx) => ({
    idx,
    name,
    cards: [],
    knowledge: _init_knowledge()
}))

export {
    characters,
    weapons,
    rooms,
    players,
    TABLE_IDX
}