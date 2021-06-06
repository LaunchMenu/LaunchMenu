/** The installer state */
export type IState<T = void> =
    | {type: "configuring" | "loading" | "finished"; name: string}
    | {
          type: "prompt";
          text: string;
          buttons: {value: T; text: string; type: "primary" | "secondary"}[];
      };
