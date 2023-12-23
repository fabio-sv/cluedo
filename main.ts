import { _playerNames } from "./data.ts";
import { Game } from "./game.ts";

const game = new Game(_playerNames);

console.log("\n*************** DATA ***************\n");
console.log(game.gameData());

console.log("\n*************** GAME ***************");

while (true) {
  const outcome = game.playRound();

  if (outcome) {
    console.log("WINNER!", outcome.player.name, outcome.rounds, outcome.roundsPBW, outcome.guess, outcome.solution)
    break;
  }
}
