import {IIOContext} from "../../../context/_types/IIOContext";
import {KeyPattern} from "../../../keyHandler/KeyPattern";

/**
 * The input data for a shortcut
 */
export type IShortcutInput = KeyPattern | ((context: IIOContext) => KeyPattern);
