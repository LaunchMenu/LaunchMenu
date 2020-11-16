import {DataCacher, Field, IDataHook} from "model-react";
import {IIOContext} from "../context/_types/IIOContext";
import {IKeyEventListener} from "../keyHandler/_types/IKeyEventListener";
import {IUILayerPathNode} from "./_types/IUILayerPathNode";
import {IUILayer} from "./_types/IUILayer";
import {IUILayerContentData} from "./_types/IUILayerContentData";
import {IUILayerFieldData} from "./_types/IUILayerFieldData";
import {IUILayerMenuData} from "./_types/IUILayerMenuData";
import {UIMissingView} from "./UILayerMissingView";
import {v4 as uuid} from "uuid";
import {getContentAction} from "../actions/types/content/getContentAction";

/**
 * An abstract class that can be used as a foundation for a UILayer
 */
export abstract class AbstractUILayer implements IUILayer {
    // An overlay element to show in case this layer has no data for a given section
    protected showNodataOverlays: boolean;
    protected UIMissingData = {
        ID: uuid(),
        contentView: UIMissingView,
        menuView: UIMissingView,
        fieldView: UIMissingView,
    };

    // Initialization management
    protected closers: (() => void)[] = [];
    protected relativePath: string;

    protected context = new Field(null as null | IIOContext);

    /**
     * Creates a new abstract UI layer
     * @param relativePath The path input
     * @param showNodataOverlays Whether to show overlays for sections without data
     */
    public constructor(relativePath: string = ".", showNodataOverlays: boolean = true) {
        this.relativePath = relativePath;
        this.showNodataOverlays = showNodataOverlays;
    }

    /**
     * Initializes the layer with the given context
     * @param context The context that the layer will be opened in
     * @returns Whether to allow for multiple initializations (defaults to false)
     */
    protected abstract initialize(
        context: IIOContext,
        close: () => void
    ): void | (() => void) | Promise<void | (() => void)>;

    /**
     * A callback for when the UI layer is opened
     * @param context The context that this layer was opened in
     * @param close A method to close this layer from the given context
     * @returns A callback for when this layer is closed (both when invoked by our close call, or closed external)
     */
    public async onOpen(context: IIOContext, close: () => void): Promise<() => void> {
        this.closers.push(close);
        const onClose = (await this.initialize(context, close)) || undefined;
        this.context.set(context);
        return async () => {
            this.context.set(null);
            const index = this.closers.indexOf(close);
            if (index >= 0) this.closers.splice(index, 1);
            await onClose?.();
        };
    }

    /**
     * Closes this UILayer from all contexts it's opened in
     */
    protected closeAll(): void {
        this.closers.forEach(closer => closer());
    }

    // Path management
    /**
     * Retrieves the path to show to the user representing this layer
     * @param hook The data hook to subscribe to changes
     * @returns The path
     */
    public getPath(hook: IDataHook = null): IUILayerPathNode[] {
        return this.absolutePath.get(hook);
    }

    /**
     * A cached getter for the absolute path
     */
    protected absolutePath = new DataCacher<IUILayerPathNode[]>(h => {
        const context = this.context.get(h);
        if (!context) return [];

        const UI = context.getUI(h);
        const index = UI.indexOf(this);
        const parent = index >= 0 ? UI[index - 1] : undefined;
        const current = parent?.getPath(h) ?? [];
        return this.relativePath.split("/").reduce((cur, node) => {
            if (node == ".") {
                // Add itself to the top path
                const top = cur[cur.length - 1];
                if (top)
                    return [
                        ...cur.slice(0, cur.length - 1),
                        {name: top.name, layers: [...top.layers, this]},
                    ];
                else return cur;
            } else if (node == "..") {
                // Remove the top element form the path
                return cur.slice(0, cur.length - 1);
            } else {
                // Add an element to the path
                return [...cur, {name: node, layers: [this]}];
            }
        }, current);
    });

    /**
     * Checks whether this layer is on the top of the stack
     * @param hook The hook to subscribe to changes
     * @returns Whether this layer is on top
     */
    protected isOnTop(hook: IDataHook = null): boolean {
        const context = this.context.get(hook);
        if (!context) return false;
        const layers = context.getUI(hook);
        return layers[layers.length - 1] == this;
    }

    // Data management
    // TODO: add a system to not call the hook if nothing changed for a given stack (menu/field/content)
    /**
     * Retrieves the menu data
     * @param hook The data hook to subscribe to changes
     * @returns The menu data of this layer
     */
    public getMenuData(hook?: IDataHook): IUILayerMenuData[] {
        return this.showNodataOverlays && this.isOnTop(hook) ? [this.UIMissingData] : [];
    }

    /**
     * Retrieves the field data
     * @param hook The data hook to subscribe to changes
     * @returns The field data of this layer
     */
    public getFieldData(hook?: IDataHook): IUILayerFieldData[] {
        return this.showNodataOverlays && this.isOnTop(hook) ? [this.UIMissingData] : [];
    }

    /**
     * Contents that are visible from the currently selected menu items
     */
    protected menuItemContents = new DataCacher(h =>
        this.getMenuData(h).flatMap(data => {
            if (!("menu" in data) || !data.menu) return [];

            const cursor = data.menu.getCursor(h);
            if (!cursor) return [];

            const cursorContents = getContentAction.get([cursor], h);
            return cursorContents;
        })
    );

    /**
     * Retrieves the content data
     * @param hook The data hook to subscribe to changes
     * @returns The content data of this layer
     */
    public getContentData(hook: IDataHook = null): IUILayerContentData[] {
        const itemContents = this.menuItemContents.get(hook);
        return this.showNodataOverlays && itemContents.length == 0 && this.isOnTop(hook)
            ? [this.UIMissingData]
            : itemContents;
    }

    /**
     * Retrieves the key listener data
     * @param hook The data hook to subscribe to changes
     * @returns The key listener data of this layer
     */
    public getKeyHandlers(hook?: IDataHook): IKeyEventListener[] {
        return [
            ...this.getMenuData(hook).map(({menuHandler}) => menuHandler),
            ...this.getFieldData(hook).map(({fieldHandler}) => fieldHandler),
            ...this.getContentData(hook).map(({contentHandler}) => contentHandler),
        ].filter((m): m is IKeyEventListener => !!m);
    }
}
