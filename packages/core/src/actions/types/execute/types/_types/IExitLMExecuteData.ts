import {IExecutableFunction} from "../../_types/IExecutable";

/**
 * The data for the exit execute handler
 */
export type IExitLMExecuteData =
    | IExecutableFunction
    | void
    | {
          execute?: IExecutableFunction;
          /** Whether to force LM to stay closed, even if it wants to be reopened from another callback or stack changes */
          forceClose?: boolean;
          /** Whether to always reopen LM (except when something force closes it), even if the stack didn't change */
          reopen?: boolean;
      };
