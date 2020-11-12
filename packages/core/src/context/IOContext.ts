import {IIOContext} from "./_types/IIOContext";
import {IUndoRedoFacility} from "../undoRedo/_types/IUndoRedoFacility";
import {SettingsContext} from "../settings/SettingsContext";
import {ISubscribable} from "../utils/subscribables/_types/ISubscribable";
import {UndoRedoFacility} from "../undoRedo/UndoRedoFacility";
import {Field, IDataHook} from "model-react";
import {IUILayer} from "../uiLayers/_types/IUILayer";
import {IActionBinding} from "../actions/_types/IActionBinding";

export class IOContext implements IIOContext {
    public readonly undoRedo: IUndoRedoFacility;
    public settings: SettingsContext;
    public readonly contextMenuBindings: ISubscribable<IActionBinding[]>;

    protected uiStack = new Field([] as {onClose?: () => void; layer: IUILayer}[]);

    /**
     * Creates a new context
     * @param context The context data
     */
    public constructor(data: {
        undoRedo?: IUndoRedoFacility;
        settings?: SettingsContext;
        contextMenuBindings?: ISubscribable<IActionBinding[]>;
    }) {
        this.undoRedo = data.undoRedo || new UndoRedoFacility();
        this.settings = data.settings || new SettingsContext();
        this.contextMenuBindings = data.contextMenuBindings || [];
    }

    /**
     * Retrieves all the UI data opened in this context
     * @param hook The hook to subscribe to changes
     * @returns All the opened UI layers
     */
    public getUI(hook: IDataHook = null): IUILayer[] {
        return this.uiStack.get(hook).map(({layer}) => layer);
    }

    /**
     * Opens the given UI layer
     * @param layer The layer of UI data to open
     * @param config Extra configuration
     * @returns A function that can be used to close the opened layer
     */
    public async open(
        layer: IUILayer,
        config?: {
            /** A callback to perform when the layer is closed */
            onClose?: () => void | Promise<void>;
            /** The index on the stack to open this layer at */
            index?: number;
            /** The UILayer to open this layer after */
            after?: IUILayer;
        }
    ): Promise<() => Promise<void>> {
        const close = () => this.close(layer);
        const layerOnClose = (await layer.onOpen(this, close)) || undefined;

        // Find the index to open the item at
        const current = this.uiStack.get(null);
        let index = Infinity;
        if (config?.index !== undefined) index = config.index;
        if (config?.after) {
            const afterIndex = current.findIndex(({layer}) => layer == config.after);
            if (afterIndex != -1) index = afterIndex + 1;
        }

        // Open the layer
        this.uiStack.set([
            ...current.slice(0, index),
            {
                layer,
                onClose: async () => {
                    await layerOnClose?.();
                    await config?.onClose?.();
                },
            },
            ...current.slice(index),
        ]);
        return close;
    }

    /**
     * Closes the given UI layer
     * @param layer The layer of UI data to close
     */
    public async close(layer: IUILayer): Promise<void> {
        const layers = this.uiStack.get(null);
        const index = layers.findIndex(({layer: l}) => layer == l);
        if (index == -1) return;
        const p = layers[index].onClose?.();
        this.uiStack.set([...layers.slice(0, index), ...layers.slice(index + 1)]);
        await p;
    }
}
