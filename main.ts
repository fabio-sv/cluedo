import { _playerNames } from "./data.ts";
import { Game } from "./game.ts";
import { stdDev } from "./util.ts";

const count = 100_000;

console.log(`Initializing ${count.toLocaleString()} games...`)
const games = new Array<Game | undefined>(count).fill(undefined).map(() => new Game(_playerNames));
console.log(`${count.toLocaleString()} games initialized, beginning...\n`)


const data = games.map((game, index) => {
  while (true) {
    const outcome = game.playRound();

    if (outcome) {
      // console.log(`${index + 1}: WINNER!`, outcome.player.name, outcome.rounds, outcome.roundsPBW)
      return outcome;
    }
  }
})

const rounds = data.map(d => d.rounds)
const roundsPBW = data.map(d => d.roundsPBW);

console.log({
  rounds: {
    average: Number(rounds.reduce((accum, curr) => accum + curr, 0) / count).toFixed(2),
    max: Math.max(...rounds),
    min: Math.min(...rounds),
    deviation: Number(stdDev(rounds).toFixed(2)),
  },
  pbw: {
    average: Number(roundsPBW.reduce((accum, curr) => accum + curr, 0) / count).toFixed(2),
    max: Math.max(...roundsPBW),
    min: Math.min(...roundsPBW),
    deviation: Number(stdDev(roundsPBW).toFixed(2)),
  },
});
