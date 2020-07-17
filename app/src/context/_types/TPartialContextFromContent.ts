import {IMenu} from "../../menus/menu/_types/IMenu";
import {TDeepPick} from "../../_types/TDeepPick";
import {IIOContext} from "./IIOContext";
import {IViewStack} from "../../stacks/_types/IViewStack";
import {IKeyHandlerStack} from "../../stacks/keyHandlerStack/_types/IKeyHandlerStack";

/**
 * Extracts the part of the context that are required in order to open the specified UI
 */
export type TPartialContextFromContent<IOpenable> = (IOpenable extends {menu: any}
    ? {panes: {menu: IViewStack}}
    : unknown) &
    (IOpenable extends {search: any} ? {panes: {search: IViewStack}} : unknown) &
    (IOpenable extends {content: any} ? {panes: {content: IViewStack}} : unknown) &
    (IOpenable extends {menu: IMenu} ? {keyHandler: IKeyHandlerStack} : unknown) & {};
