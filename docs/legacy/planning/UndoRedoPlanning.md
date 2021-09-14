# Undo Redo facility
- Allows for tracking of history in order to undo and redo

## Commands
- Commands have execute and revert functions 
- Execute and revert can be asynchronous
- Commands can indicate their resource dependencies

## Undo / Redo behavior
- Commands can be executed or reverted only if they indicate not to be locked
- Commands must be executed in sequence, and reverted in sequence. 
  - This only applies to starting of execution/revertion, they can finish in multiple orders
  - If commands have shared resources, one must finish before the next starts (revert or execute)
    - This is done by making the command indicate it's locked when resources aren't available

## Compound command
- Compound commands can simply be passed as an array of commands