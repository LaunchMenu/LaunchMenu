export type IEvaluationResult =
    | {
          error: any;
      }
    | {
          result: {
              text: string;
              raw: any;
              formatted: JSX.Element;
          };
      };
