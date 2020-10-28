import {IUndoRedoFacility} from "../../undoRedo/_types/IUndoRedoFacility";
import {SettingsContext} from "../../settings/SettingsContext";
import {ISubscribable} from "../../utils/subscribables/_types/ISubscribable";
import {IContextMenuItemGetter} from "../../menus/actions/contextAction/_types/IContextMenuItemGetter";
import {IUILayer} from "../../uiLayers/_types/IUILayer";
import {IDataHook} from "model-react";

/**
 * A context to get general IO utilities from
 */
export type IIOContext = {
    /**
     * Retrieves all the UI data opened in this context
     * @param hook The hook to subscribe to changes
     * @returns All the opened UI layers
     */
    getUI(hook?: IDataHook): IUILayer[];
    /**
     * Opens the given UI layer
     * @param layer The layer of UI data to open
     * @param onClose A callback to perform when the layer is closed
     * @returns A function that can be used to close the opened layer
     */
    open(layer: IUILayer, onClose?: () => void | Promise<void>): Promise<() => void>;
    /**
     * Closes the given UI layer
     * @param layer The layer of UI data to close
     */
    close(layer: IUILayer): Promise<void>;

    /** The undo redo facility to undo changes */
    readonly undoRedo: IUndoRedoFacility;
    /** The application settings */
    readonly settings: SettingsContext;
    /** The default context menu items to add to all context menus */
    readonly contextMenuItems: ISubscribable<IContextMenuItemGetter[]>;
};
