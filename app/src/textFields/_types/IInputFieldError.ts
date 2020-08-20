import {IMenuItem} from "../../menus/items/_types/IMenuItem";

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
          menuItem: IMenuItem;
      }
);
