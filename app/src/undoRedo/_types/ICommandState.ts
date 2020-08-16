/** The state of the command */
export type ICommandState =
    | "ready"
    | "preparingForExecution"
    | "executing"
    | "executed"
    | "preparingForRevert"
    | "reverting";
