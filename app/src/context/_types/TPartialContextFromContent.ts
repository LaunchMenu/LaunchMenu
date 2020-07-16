import {IMenu} from "../../menus/menu/_types/IMenu";
import {TDeepPick} from "../../_types/TDeepPick";
import {IIOContext} from "./IIOContext";

/**
 * Extracts the part of the context that are required in order to open the specified UI
 */
export type TPartialContextFromContent<IOpenable> = TDeepPick<
    IIOContext,
    (IOpenable extends {menu: any} ? {panes: {menu: true}} : unknown) &
        (IOpenable extends {search: any} ? {panes: {search: true}} : unknown) &
        (IOpenable extends {content: any} ? {panes: {content: true}} : unknown) &
        (IOpenable extends {menu: IMenu} ? {keyHandler: true} : unknown)
>;
