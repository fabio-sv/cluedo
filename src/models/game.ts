import { TABLE_IDX, characters, rooms, weapons } from "../data/index.ts";
import { _init_knowledge } from "../utils/init.ts";
import { Answer, CluedoAtom, CluedoSet, IGame, Outcome, Player, Status } from "../types.ts";
import { ask, choose, draw, guess, shuffle, solution, update } from "../utils/helpers.ts";

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

export class Game implements IGame {
    solution: CluedoSet;
    cardsPerHand: number;
    players: Player[];
    table: string[];
    round: number;
    winner: number | undefined;
    answers: Answer[];
    deck: { characters: string[]; weapons: string[]; rooms: string[]; };
    debuggingEnabled = false;

    constructor(playerNames: string[]) {
        this.round = 0;

        this.players = playerNames.map<Player>((name, idx) => ({
            idx,
            name,
            cards: [],
            knowledge: _init_knowledge()
        }))

        this.deck = {
            characters: [...characters],
            weapons: [...weapons],
            rooms: [...rooms]
        }

        this.solution = {
            character: choose(this.deck.characters),
            weapon: choose(this.deck.weapons),
            room: choose(this.deck.rooms),
        }

        this.answers = [];

        // at first, is all cards, but after splices, becomes leftovers
        this.table = shuffle(this.deck.characters, this.deck.weapons, this.deck.rooms)
        this.cardsPerHand = Math.floor(this.table.length / this.players.length);

        this.players.forEach(player => { player.cards = draw(this.table, this.cardsPerHand) })

        this.players.forEach((player, playerIndex) => {
            const updates: CluedoAtom[] = ([] as CluedoAtom[]).concat(
                // add players cards to knowledge base
                ...player.cards.map<CluedoAtom>(card => ({
                    name: card,
                    location: playerIndex,
                    status: Status.FOUND,
                })),
                // and cards on table if there are any
                ...this.table.map<CluedoAtom>(card => ({
                    name: card,
                    location: TABLE_IDX,
                    status: Status.FOUND
                }))
            )

            player.knowledge = update(player, updates)
        })
    }

    gameData() {
        return {
            cph: this.cardsPerHand,
            solution: this.solution,
            players: this.players.map(p => ({ name: p.name, cards: p.cards })),
            table: this.table,
        }
    }

    debugging(enabled: boolean) {
        this.debuggingEnabled = enabled;
    }

    debug(...data: unknown[]) {
        if (this.debuggingEnabled) {
            console.debug(...data);
        }
    }


    playRound(): Outcome | undefined {
        const current = this.players[this.round % this.players.length];
        this.debug(`\n${current.idx}: ROUND ${this.round}`);
        this.debug(`${current.idx}: ${current.name}'s turn`);
        const currentSolution = solution(current);

        if (currentSolution) {
            const areTheyCorrect = currentSolution.character === this.solution.character && currentSolution.weapon === this.solution.weapon && currentSolution.room === this.solution.room;

            this.debug(`${current.idx}: CLUEDO!`)
            this.debug(`${current.idx}: ${current.name} claims the murder was committed by ${currentSolution.character} with ${currentSolution.weapon} in the ${currentSolution.room}...`);
            this.debug(`${current.idx}: Are they correct? They are${areTheyCorrect ? '!' : ' not!'}`);

            this.winner = current.idx;
            return {
                player: current,
                guess: currentSolution,
                solution: this.solution,
                rounds: this.round,
                roundsPBW: Math.ceil(this.round / this.players.length)
            };
        }

        let shown = false;
        const currentGuess = guess(current);
        this.debug(`${current.idx}: guess`, currentGuess);

        for (let i = (current.idx + 1) % this.players.length; i !== current.idx; i = (i + 1) % this.players.length) {
            const player = this.players[i];

            if (player.idx != current.idx) {
                this.debug(`${current.idx}: asking ${player.name}`);
                const response = ask(player, currentGuess)

                this.answers.push({
                    interrogator: current.idx,
                    responder: player.idx,
                    set: currentGuess
                });

                if (response) {
                    this.debug(`${current.idx}: ${player.name} can help <${response}>. Adding to ${current.name}'s knowledge.`)
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
            this.debug(`${current.idx}: No one can help. Adding ${Object.values(currentGuess).join(', ')} to ${current.name}'s knowledge.`)

            const updateAtoms: CluedoAtom[] = Object.values(currentGuess).map<CluedoAtom>(guessAtom => ({
                name: guessAtom,
                status: Status.SOLUTION
            }))

            update(current, updateAtoms)
        }

        this.round++;
        this.debug();

    }
}