import { _playerNames } from "./data.ts";
import { Game } from "./game.ts";
import { getMax, getMin, stdDev } from "./util.ts";

const count = 1_000_000;
const data: { rounds: number; roundsPBW: number }[] = [];

for (let index = 0; index < count; index++) {
  const game = new Game(_playerNames);

  while (true) {
    const outcome = game.playRound();

    if (outcome) {
      data.push({
        rounds: outcome.rounds,
        roundsPBW: outcome.roundsPBW
      })
      break;
    }
  }
}

const rounds = data.map(d => d.rounds)
const roundsPBW = data.map(d => d.roundsPBW);

console.log({
  rounds: {
    average: Number(rounds.reduce((accum, curr) => accum + curr, 0) / count).toFixed(2),
    max: getMax(rounds),
    min: getMin(rounds),
    deviation: Number(stdDev(rounds).toFixed(2)),
  },
  pbw: {
    average: Number(roundsPBW.reduce((accum, curr) => accum + curr, 0) / count).toFixed(2),
    max: getMax(roundsPBW),
    min: getMin(roundsPBW),
    deviation: Number(stdDev(roundsPBW).toFixed(2)),
  },
});
