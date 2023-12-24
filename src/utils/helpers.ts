import { TABLE_IDX } from "../data/index.ts";
import { CluedoAtom, CluedoSet, Knowledge, Player, Status } from "../types.ts";

function random(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getMax(arr: number[]) {
  let len = arr.length;
  let max = -Infinity;

  while (len--) {
    max = arr[len] > max ? arr[len] : max;
  }
  return max;
}

function getMin(arr: number[]) {
  let len = arr.length;
  let min = Infinity;

  while (len--) {
    min = arr[len] < min ? arr[len] : min;
  }

  return min;
}

function stdDev(arr: number[]) {
  const mean = arr.reduce((sum, value) => sum + value, 0) / arr.length;
  const deviations = arr.map((value) => value - mean);
  const squaredDeviations = deviations.map((deviation) => deviation ** 2);
  const meanSquaredDeviations =
    squaredDeviations.reduce((sum, value) => sum + value, 0) / arr.length;
  const standardDeviation = Math.sqrt(meanSquaredDeviations);

  return standardDeviation;
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
  return atoms.map<CluedoAtom>((c) => {
    const matchedUpdate = updates.find((u) => u.name === c.name);

    if (matchedUpdate && c.status === Status.UNKNOWN) {
      c.location = matchedUpdate.location;
      c.status = matchedUpdate.status;
    }

    return c;
  });
}

function update(player: Player, updates: CluedoAtom[]): Knowledge {
  if (updates.length > 0) {
    player.knowledge.characters = updateAtoms(
      player.knowledge.characters,
      updates,
    );
    player.knowledge.weapons = updateAtoms(player.knowledge.weapons, updates);
    player.knowledge.rooms = updateAtoms(player.knowledge.rooms, updates);
  }

  return player.knowledge;
}

// THE BRAIN
function getGuessAtom(array: CluedoAtom[], self_idx: number): string {
  const shuffled_array = shuffle(array);

  // valid for guessing is either:
  // 1. unknown cards
  // 2. solution first
  // 3. own cards
  // 4. table cards
  // 5. fallback

  // 1
  let guess = shuffled_array.find((c) => c.status === Status.UNKNOWN);
  if (guess) return guess.name;

  // 2
  guess = shuffled_array.find((c) => c.status === Status.SOLUTION);
  if (guess) return guess.name;

  // 3
  guess = shuffled_array.find((c) =>
    c.status === Status.FOUND && c.location === self_idx
  );
  if (guess) return guess.name;

  // 4
  guess = shuffled_array.find((c) =>
    c.status === Status.FOUND && c.location === TABLE_IDX
  );
  if (guess) return guess.name;

  // 5 - fallback
  guess = shuffled_array.find((c) => c);
  if (guess) return guess.name;

  throw new Error(
    `GUESS ATOM ERROR: ${JSON.stringify(array)} for player ${
      JSON.stringify(self_idx)
    }`,
  );
}

function guess(player: Player): CluedoSet {
  try {
    const character = getGuessAtom(player.knowledge.characters, player.idx);
    const weapon = getGuessAtom(player.knowledge.weapons, player.idx);
    const room = getGuessAtom(player.knowledge.rooms, player.idx);

    return {
      character,
      weapon,
      room,
    };
  } catch (error: unknown) {
    if (error instanceof Error) {
      throw new Error(
        `GUESS ERROR: ${JSON.stringify(player)}\n${error?.message}`,
      );
    }

    throw new Error(`GUESS ERROR: ${JSON.stringify(player)}\n${error}`);
  }
}

function ask(responder: Player, set: CluedoSet) {
  return Object.values(set).find((card) => responder.cards.includes(card));
}

function getSolutionAtom(array: CluedoAtom[]): CluedoAtom | undefined {
  return array.find((character) => character.status === Status.SOLUTION);
}

function solution(player: Player): CluedoSet | undefined {
  const character = getSolutionAtom(player.knowledge.characters);
  const weapon = getSolutionAtom(player.knowledge.weapons);
  const room = getSolutionAtom(player.knowledge.rooms);

  if (character && weapon && room) {
    return {
      character: character.name,
      weapon: weapon.name,
      room: room.name,
    };
  }
}

export {
  ask,
  choose,
  draw,
  getMax,
  getMin,
  guess,
  shuffle,
  solution,
  stdDev,
  update,
};
