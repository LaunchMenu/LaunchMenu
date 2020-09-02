import {IViewStackItem} from "../../../../stacks/_types/IViewStackItem";

/**
 * An error for input fields that can be displayed in the menu
 */
export type IInputFieldError = {
    ranges?: {start: number; end: number}[];
} & (
    | {
          message: string;
      }
    | {
          view: IViewStackItem;
      }
);
