import {IMenu} from "../../menus/menu/_types/IMenu";
import {IViewStack} from "../../stacks/_types/IViewStack";
import {IKeyHandlerStack} from "../../stacks/keyHandlerStack/_types/IKeyHandlerStack";

// prettier-ignore

/**
 * Extracts the part of the context that are required in order to open the specified UI
 */
export type TPartialContextFromContent<IOpenable> = 
    (IOpenable extends {menu: any} ? {panes: {menu: IViewStack}} : unknown) &
    (IOpenable extends {menu: {search:true}} ? {panes: {field: IViewStack}} : unknown) &
    (IOpenable extends {menu: IMenu} ? {keyHandler: IKeyHandlerStack} : unknown) &

    (IOpenable extends {field: any} ? {panes: {field: IViewStack}} : unknown) &

    (IOpenable extends {content: any} ? {panes: {content: IViewStack}} : unknown) &
    
    (IOpenable extends {keyHandler: any} ? {keyHandler: IKeyHandlerStack} : unknown) & {};
