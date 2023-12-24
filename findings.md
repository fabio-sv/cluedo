# Findings

1. [Algo 1](#Algo1)

### Algo 1

```ts
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
```

Results:

```ts
{
  games: 1_000_000,
  rounds: { average: "28.66", max: 52, min: 4, deviation: 10.91 },
  pbw: { average: "7.53", max: 13, min: 1, deviation: 2.74 }
}
```
