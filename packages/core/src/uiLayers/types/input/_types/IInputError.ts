import {IViewStackItem} from "../../../../uiLayers/_types/IViewStackItem";

/**
 * An error for input fields that can be displayed in the menu
 */
export type IInputError = {
    ranges?: {start: number; end: number}[];
} & (
    | {
          message: string;
      }
    | {
          view: IViewStackItem;
      }
);
