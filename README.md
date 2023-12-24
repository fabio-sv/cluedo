# Cluedo

## Purpose

To find out the best possible way to play cluedo such that you maximise the
following heuristics:

1. Maximise the information gained when interrogating
2. Minimize the information leaked when interrogating
3. Minimize the information leaked when revealing

## Setup

1. [install deno](https://docs.deno.com/runtime/manual/getting_started/installation)
2. run `deno task start`

## Roadmap

1. Fix knowledge base. Knowledge base should be a matrix capable of tracking who
   has what, who doesn't have what, and who could possibly have what. Current
   knowledge base only reflects who has what.
2. Remove question logging. Not needed. Information can be maximised from
   knowledge base matrix.
3. Generate all possible interrogations and assign scores to each interrogation
   that reflects information gain.
4. Possibly use a model for the above.
