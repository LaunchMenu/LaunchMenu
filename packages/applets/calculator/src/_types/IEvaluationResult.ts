import {ISyntaxError} from "./errors/ISyntaxError";

export type IEvaluationResult =
    | {
          error: ISyntaxError | Error;
      }
    | {
          /** The evaluated expression, which may include fixes */
          expression: string;
          /** The result */
          result: {
              text: string;
              raw: any;
              formatted: JSX.Element;
          };
      };
