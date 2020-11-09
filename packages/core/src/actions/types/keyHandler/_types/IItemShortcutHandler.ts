import {IIOContext} from "../../../../context/_types/IIOContext";
import {KeyPattern} from "../../../../keyHandler/KeyPattern";
import {IActionBinding} from "../../../_types/IActionBinding";
import {IActionTarget} from "../../../_types/IActionTarget";
import {IExecutable} from "../../execute/_types/IExecutable";

/**
 * The data used to create a shortcut handler
 */
export type IItemShortcutHandler = {
    shortcut: KeyPattern | ((context: IIOContext) => KeyPattern);
} & (
    | {
          onExecute: IActionBinding | IExecutable;
      }
    | {
          target: IActionTarget | (() => IActionTarget);
      }
);
