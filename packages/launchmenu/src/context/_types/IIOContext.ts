import {IViewStack} from "../../stacks/viewStack/_types/IViewStack";
import {IKeyHandlerStack} from "../../stacks/keyHandlerStack/_types/IKeyHandlerStack";
import {IUndoRedoFacility} from "../../undoRedo/_types/IUndoRedoFacility";
import {SettingsContext} from "../../settings/SettingsContext";
import {ISubscribable} from "../../utils/subscribables/_types/ISubscribable";
import {IPrioritizedMenuItem} from "../../menus/menu/_types/IPrioritizedMenuItem";

/**
 * A context to get general IO utilities from
 */
export type IIOContext = {
    /** The different UI panes */
    readonly panes: {
        readonly field: IViewStack;
        readonly menu: IViewStack;
        readonly content: IViewStack;
    };
    /** The keyhandler stack for keyboard interaction */
    readonly keyHandler: IKeyHandlerStack;
    /** The undo redo facility to undo changes */
    readonly undoRedo: IUndoRedoFacility;
    /** The application settings */
    readonly settings: SettingsContext;
    /** The default context menu items to add to all context menus */
    readonly contextMenuItems: ISubscribable<IPrioritizedMenuItem[]>;
};

/**
 * A context to get general IO utilities from, if available
 */
export type IPartialIOContext = {
    readonly panes?: Partial<IIOContext["panes"]>;
    readonly keyHandler?: IKeyHandlerStack;
    readonly undoRedo?: IUndoRedoFacility;
    readonly settings?: SettingsContext;
    readonly contextMenuItems?: ISubscribable<IPrioritizedMenuItem[]>;
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
    if (!context.contextMenuItems) return false;
    return true;
}
