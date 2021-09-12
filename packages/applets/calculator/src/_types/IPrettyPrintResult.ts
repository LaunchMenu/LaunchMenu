export type IPrettyPrintResult =
    | {
          error: any;
      }
    | {
          formatted: JSX.Element;
      };
