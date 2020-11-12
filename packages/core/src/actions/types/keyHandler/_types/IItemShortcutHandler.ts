import {IIOContext} from "../../../../context/_types/IIOContext";
import {KeyPattern} from "../../../../keyHandler/KeyPattern";
import {IUUID} from "../../../../_types/IUUID";
import {IActionBinding} from "../../../_types/IActionBinding";
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
          itemID: IUUID;
      }
);
