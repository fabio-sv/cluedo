import { TABLE_IDX, characters, players, rooms, weapons } from "./data.ts";
import { CluedoAtom, CluedoSet, Player, Status } from "./types.ts";
import { ask, choose, draw, guess, shuffle, solution, update } from "./util.ts";

console.log("\n*************** DATA ***************\n");
console.log({ characters: characters.length, weapons: weapons.length, rooms: rooms.length })

const gameSolution: CluedoSet = {
  character: choose(characters),
  weapon: choose(weapons),
  room: choose(rooms),
}

console.log({ solution: gameSolution });

const deck = shuffle(characters, weapons, rooms)
const cardsPerHand = Math.floor(deck.length / players.length)

console.log({ cardsPerPlayer: cardsPerHand });

players.map(player => { player.cards = draw(deck, cardsPerHand) })
// update each player's knowledge base
players.map((player, playerIndex) => {
  const updates: CluedoAtom[] = ([] as CluedoAtom[]).concat(
    // add players cards to knowledge base
    ...player.cards.map<CluedoAtom>(card => ({
      name: card,
      location: playerIndex,
      status: Status.FOUND,
    })),
    // and cards on table if there are any
    ...deck.map<CluedoAtom>(card => ({
      name: card,
      location: TABLE_IDX,
      status: Status.FOUND
    }))
  )

  player.knowledge = update(player, updates)
})


console.log({
  players: players.map(({ name, cards }) => ({ name, cards })),
  table: deck
})

console.log("\n*************** GAME ***************");


let idx = 0;

while (true) {
  // prompt();
  const current = players[idx % players.length];
  console.log(`\n${current.idx}: ROUND ${idx}`);
  console.log(`${current.idx}: ${current.name}'s turn`);

  const currentSolution = solution(current);

  if (currentSolution) {
    console.log(`${current.idx}: ${current.name} WINS! `)
    console.log(`${current.idx}: The murder was committed by ${currentSolution.character} with ${currentSolution.weapon} in the ${currentSolution.room}...`);
    break;
  }

  const currentGuess = guess(current);
  console.log(`${current.idx}: guess`, currentGuess);
  let shown = false;

  for (let i = (current.idx + 1) % players.length; i !== current.idx; i = (i + 1) % players.length) {
    const player = players[i];

    if (player.idx != current.idx) {
      console.log(`${current.idx}: asking ${player.name}`)
      const response = ask(player, currentGuess)

      if (response) {
        console.log(`${current.idx}: ${player.name} can help <${response}>. Adding to ${current.name}'s knowledge.`)
        const updateAtom: CluedoAtom = {
          name: response,
          location: player.idx,
          status: Status.FOUND
        }

        update(current, [updateAtom]);
        shown = true;
        break;
      }
    }
  }

  if (!shown) {
    console.log(`${current.idx}: No one can help. Adding ${Object.values(currentGuess).join(', ')} to ${current.name}'s knowledge.`)

    const updateAtoms: CluedoAtom[] = Object.values(currentGuess).map<CluedoAtom>(guessAtom => ({
      name: guessAtom,
      status: Status.SOLUTION
    }))

    update(current, updateAtoms)
  }

  idx++;
  console.log();
}

// for each player
//   if player is not me
//    ask if they have one of my question
//    if they do, show me, break.
//    if they don't continue to next player and ask.
// no one has any of my q. Use knowledge base + guess to mark solution 

// **************************************************************
//                      CLUEDO GAME LOGIC
// **************************************************************

// while !winner
// foreach player
//    if player has solution
//      cluedo, raise solution
//      if solution correct, player wins. EXIT
//      else player eliminated.
//    
//    player makes guess
//    
//    foreach player
//      if player is not me
//        ask if they have one of my guess
//
//        if they do, show me. update knowledge. set shown true. break
//    
//    if shown false, use knowledge base + guess to mark solution
