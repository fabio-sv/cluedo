import { TABLE_IDX } from "./data.ts";
import { CluedoAtom, CluedoSet, Knowledge, Player, Question, Status } from "./types.ts";


function random(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function choose<T>(array: T[]): T {
    return array.splice(random(0, array.length - 1), 1)[0];
}

function shuffle<T>(...arrays: T[][]): T[] {
    const combinedArray: T[] = ([] as T[]).concat(...arrays);

    // Shuffle the combined array using the Fisher-Yates algorithm
    for (let i = combinedArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [combinedArray[i], combinedArray[j]] = [combinedArray[j], combinedArray[i]];
    }

    return combinedArray;
}

/**
 * IMPORTANT: removes from deck array
 * @param deck 
 * @param quantity 
 * @returns 
 */
function draw(deck: string[], quantity: number) {
    return deck.splice(0, quantity);
}

function updateAtoms(atoms: CluedoAtom[], updates: CluedoAtom[]) {
    return atoms.map<CluedoAtom>(c => {
        const matchedUpdate = updates.find(u => u.name === c.name);

        if (matchedUpdate && c.status === Status.UNKNOWN) {
            c.location = matchedUpdate.location
            c.status = matchedUpdate.status
        }

        return c;
    })
}

function update(player: Player, updates: CluedoAtom[]): Knowledge {
    if (updates.length > 0) {
        player.knowledge.characters = updateAtoms(player.knowledge.characters, updates);
        player.knowledge.weapons = updateAtoms(player.knowledge.weapons, updates);
        player.knowledge.rooms = updateAtoms(player.knowledge.rooms, updates);
    }

    return player.knowledge;
}


// THE BRAIN
function getGuessAtom(array: CluedoAtom[], self_idx: number): string {
    // valid for guessing is either:
    // 1. unknown cards
    // 2. solution first
    // 3. own cards
    // 4. table cards
    // 5. fallback

    const shuffled_array = shuffle(array);
    let guess: CluedoAtom | undefined;

    // 1
    guess = shuffled_array.find(c => c.status === Status.UNKNOWN);
    if (guess) return guess.name;

    // 2
    guess = shuffled_array.find(c => c.status === Status.SOLUTION);
    if (guess) return guess.name;

    // 3
    guess = shuffled_array.find(c => c.status === Status.FOUND && c.location === self_idx);
    if (guess) return guess.name;

    // 4
    guess = shuffled_array.find(c => c.status === Status.FOUND && c.location === TABLE_IDX);
    if (guess) return guess.name;

    // 5 - fallback
    guess = shuffled_array.find(c => c);
    if (guess) return guess.name;

    // const guess = shuffled_array.find(c =>
    //     (c.status === Status.UNKNOWN) || // 1
    //     (c.status === Status.SOLUTION) ||  // 2
    //     (c.status === Status.FOUND && c.location === self_idx) || // 3
    //     (c.status === Status.FOUND && c.location === TABLE_IDX) || // 4
    //     (c) // fallback if all of set have been found, player has none of set, and table has none of set.
    //     // Example: Say a player gets characters and weapons, but no rooms. The cards on the table don't include rooms.
    //     // Which card do we use in the guess? 
    //     // As a rule, should use one of the cards from the person you will ask last since you could gain information from prior players 
    //     // (TO BE IMPLEMENTED)
    // );

    throw new Error(`GUESS ATOM ERROR: ${JSON.stringify(array)} for player ${JSON.stringify(self_idx)}`);
}

function guess(player: Player): CluedoSet {
    try {
        const character = getGuessAtom(player.knowledge.characters, player.idx);
        const weapon = getGuessAtom(player.knowledge.weapons, player.idx);
        const room = getGuessAtom(player.knowledge.rooms, player.idx);

        return {
            character,
            weapon,
            room
        }
        // @ts-ignore
    } catch (error: { message: string }) {
        throw new Error(`GUESS ERROR: ${JSON.stringify(player)}\n${error?.message}`)
    }
}

function ask(responder: Player, set: CluedoSet) {
    return Object.values(set).find(card => responder.cards.includes(card));
}

function getSolutionAtom(array: CluedoAtom[]): CluedoAtom | undefined {
    return array.find(character => character.status === Status.SOLUTION);
}

function solution(player: Player): CluedoSet | undefined {
    const character = getSolutionAtom(player.knowledge.characters)
    const weapon = getSolutionAtom(player.knowledge.weapons);
    const room = getSolutionAtom(player.knowledge.rooms);

    if (character && weapon && room) {
        return {
            character: character.name,
            weapon: weapon.name,
            room: room.name
        }
    }
}

export {
    choose,
    shuffle,
    draw,
    update,
    guess,
    ask,
    solution
}