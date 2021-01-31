import {IUndoRedoFacility} from "../../undoRedo/_types/IUndoRedoFacility";
import {SettingsContext} from "../../settings/SettingsContext";
import {ISubscribable} from "../../utils/subscribables/_types/ISubscribable";
import {IUILayer} from "../../uiLayers/_types/IUILayer";
import {IDataHook} from "model-react";
import {IActionBinding} from "../../actions/_types/IActionBinding";
import {LMSession} from "../../application/LMSession/LMSession";

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
     * @param config Extra configuration
     * @returns A function that can be used to close the opened layer
     */
    open(
        layer: IUILayer,
        config?: {
            /** A callback to perform when the layer is closed */
            onClose?: () => void | Promise<void>;
            /** The index on the stack to open this layer at */
            index?: number;
        }
    ): Promise<() => void>;
    /**
     * Closes the given UI layer
     * @param layer The layer of UI data to close
     */
    close(layer: IUILayer): Promise<void>;

    /**
     * Whether LM is running in dev mode
     * @param hook The hook to subscribe to changes
     * @returns Whether dev mode is enabled
     */
    isInDevMode(hook?: IDataHook): boolean;

    /** The undo redo facility to undo changes */
    readonly undoRedo: IUndoRedoFacility;
    /** The application settings */
    readonly settings: SettingsContext;
    /** The default context menu bindings to add to all context menus */
    readonly contextMenuBindings: ISubscribable<IActionBinding[]>;
    /** The session that this context is for */
    readonly session?: LMSession;
};
