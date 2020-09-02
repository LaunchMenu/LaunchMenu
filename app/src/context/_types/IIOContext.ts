import {IViewStack} from "../../stacks/_types/IViewStack";
import {IKeyHandlerStack} from "../../stacks/keyHandlerStack/_types/IKeyHandlerStack";
import {IUndoRedoFacility} from "../../undoRedo/_types/IUndoRedoFacility";
import {SettingsContext} from "../../settings/SettingsContext";

/**
 * A context to get general IO utilities from
 */
export type IIOContext = {
    panes: {
        field: IViewStack;
        menu: IViewStack;
        content: IViewStack;
    };
    keyHandler: IKeyHandlerStack;
    undoRedo: IUndoRedoFacility;
    settings: SettingsContext;
};

/**
 * A context to get general IO utilities from, if available
 */
export type IPartialIOContext = {
    panes?: Partial<IIOContext["panes"]>;
    keyHandler?: IKeyHandlerStack;
    undoRedo?: IUndoRedoFacility;
    settings?: SettingsContext;
};

/**
 * Checks whether a given object is an IO context
 * @param context The object to check
 * @returns Whether the passed object is a full IOContext
 */
export function isIOContext(context: IPartialIOContext): context is IIOContext {
    if (!context.panes) return false;
    if (!context.panes.content) return false;
    if (!context.panes.menu) return false;
    if (!context.panes.field) return false;
    if (!context.keyHandler) return false;
    if (!context.undoRedo) return false;
    if (!context.settings) return false;
    return true;
}
