import {IIOContext} from "./_types/IIOContext";
import {IUndoRedoFacility} from "../undoRedo/_types/IUndoRedoFacility";
import {SettingsContext} from "../settings/SettingsContext";
import {ISubscribable} from "../utils/subscribables/_types/ISubscribable";
import {UndoRedoFacility} from "../undoRedo/UndoRedoFacility";
import {Field, IDataHook} from "model-react";
import {IUILayer} from "../uiLayers/_types/IUILayer";
import {IActionBinding} from "../actions/_types/IActionBinding";
import {LMSession} from "../application/LMSession/LMSession";
import {SubIOContextLayer} from "./SubIOContextLayer";

export class IOContext implements IIOContext {
    public readonly undoRedo: IUndoRedoFacility;
    public settings: SettingsContext;
    public readonly contextMenuBindings: ISubscribable<IActionBinding[]>;
    public readonly session?: LMSession;

    protected closeLayer: Promise<() => void> | undefined;
    protected uiStack = new Field([] as {onClose?: () => void; layer: IUILayer}[]);

    /**
     * Retrieves whether running in development mode
     * @param hook The hook to subscribe to changes
     * @returns Whether the application is in development mode
     */
    public readonly isInDevMode: (hook?: IDataHook) => boolean;

    /**
     * Creates a new context
     * @param context The context data
     */
    public constructor(data: {
        isInDevMode?: (hook?: IDataHook) => boolean;
        undoRedo?: IUndoRedoFacility;
        settings?: SettingsContext;
        contextMenuBindings?: ISubscribable<IActionBinding[]>;
        session?: LMSession;
        parent?: IIOContext;
    }) {
        this.isInDevMode = data.isInDevMode || data.parent?.isInDevMode || (() => false);
        this.undoRedo = data.undoRedo || data.parent?.undoRedo || new UndoRedoFacility();
        this.settings = data.settings || data.parent?.settings || new SettingsContext();
        this.contextMenuBindings =
            data.contextMenuBindings || data.parent?.contextMenuBindings || [];
        this.session = data.session || data.parent?.session;
        if (data.parent) this.closeLayer = data.parent.open(new SubIOContextLayer(this));
    }

    /**
     * Retrieves all the UI data opened in this context
     * @param hook The hook to subscribe to changes
     * @returns All the opened UI layers
     */
    public getUI(hook?: IDataHook): IUILayer[] {
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
        }
    ): Promise<() => Promise<void>> {
        const close = () => this.close(layer);
        const layerOnClose = (await layer.onOpen(this, close)) || undefined;

        // Find the index to open the item at
        const current = this.uiStack.get();
        let index = Infinity;
        if (config?.index !== undefined) index = config.index;

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
        const layers = this.uiStack.get();
        const index = layers.findIndex(({layer: l}) => layer == l);
        if (index == -1) return;
        const p = layers[index].onClose?.();
        this.uiStack.set([...layers.slice(0, index), ...layers.slice(index + 1)]);
        await p;
    }

    /**
     * Removes all layers from this context, properly destroying it
     */
    public async destroy(): Promise<void> {
        await this.closeAll(true);
        (await this.closeLayer)?.();
    }

    /**
     * Closes all layers opened in this context
     * @param closeSessionLayer Whether to also close the base session layer
     */
    public async closeAll(closeSessionLayer?: boolean): Promise<void> {
        const allLayers = this.uiStack.get();
        const closeLayers = closeSessionLayer ? allLayers : allLayers.slice(1);
        const layerOrder = closeLayers.reverse();
        for (let {layer} of layerOrder) await this.close(layer);
    }
}
