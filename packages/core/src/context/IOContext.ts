import {IIOContext} from "./_types/IIOContext";
import {IUndoRedoFacility} from "../undoRedo/_types/IUndoRedoFacility";
import {SettingsContext} from "../settings/SettingsContext";
import {ISubscribable} from "../utils/subscribables/_types/ISubscribable";
import {IContextMenuItemGetter} from "../menus/actions/contextAction/_types/IContextMenuItemGetter";
import {UndoRedoFacility} from "../undoRedo/UndoRedoFacility";
import {Field, IDataHook} from "model-react";
import {IUILayer} from "../uiLayers/_types/IUILayer";

export class IOContext implements IIOContext {
    public readonly undoRedo: IUndoRedoFacility;
    public settings: SettingsContext;
    public readonly contextMenuItems: ISubscribable<IContextMenuItemGetter[]>;

    protected uiStack = new Field([] as {onClose?: () => void; layer: IUILayer}[]);

    /**
     * Creates a new context
     * @param context The context data
     */
    public constructor(data: {
        undoRedo?: IUndoRedoFacility;
        settings?: SettingsContext;
        contextMenuItems?: ISubscribable<IContextMenuItemGetter[]>;
    }) {
        this.undoRedo = data.undoRedo || new UndoRedoFacility();
        this.settings = data.settings || new SettingsContext();
        this.contextMenuItems = data.contextMenuItems || [];
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
     * @param onClose A callback to perform when the layer is closed
     * @returns A function that can be used to close the opened layer
     */
    public async open(
        layer: IUILayer,
        onClose?: () => void | Promise<void>
    ): Promise<() => void> {
        const close = () => {
            this.close(layer);
        };
        const layerOnClose = (await layer.onOpen(this, close)) || undefined;
        this.uiStack.set([
            ...this.uiStack.get(null),
            {
                layer,
                onClose: async () => {
                    await layerOnClose?.();
                    await onClose?.();
                },
            },
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