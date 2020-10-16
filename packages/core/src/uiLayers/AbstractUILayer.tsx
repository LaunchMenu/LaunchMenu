import {Field, IDataHook} from "model-react";
import {IIOContext} from "../context/_types/IIOContext";
import {IKeyEventListener} from "../keyHandler/_types/IKeyEventListener";
import {IUILayerPathNode} from "./_types/IUILayerPathNode";
import {IUILayer} from "./_types/IUILayer";
import {IUILayerContentData} from "./_types/IUILayerContentData";
import {IUILayerFieldData} from "./_types/IUILayerFieldData";
import {IUILayerMenuData} from "./_types/IUILayerMenuData";

/**
 * An abstract class that can be used as a foundation for a UILayer
 */
export abstract class AbstractUILayer implements IUILayer {
    // Initialization management
    protected closers: (() => void)[] = [];
    protected relativePath: string;
    protected path = new Field([] as IUILayerPathNode[]);

    /**
     * Creates a new abstract UI layer
     * @param relativePath The path input
     */
    public constructor(relativePath: string = ".") {
        this.relativePath = relativePath;
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
        this.path.set(this.getAbsolutePath(this.relativePath, context));
        return async () => {
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
        return this.path.get(hook);
    }

    /**
     * Retrieves the new absolute path given a relative path and the context
     * @param relativePath The relative path
     * @param context The context
     * @returns The absolute path
     */
    protected getAbsolutePath(
        relativePath: string,
        context: IIOContext
    ): IUILayerPathNode[] {
        const UI = context.getUI();
        const current = UI[UI.length - 1]?.getPath() ?? [];
        return relativePath.split("/").reduce((cur, node) => {
            if (node == ".") return cur;
            else if (node == "..") return cur.slice(1);
            else return [...cur, {name: node, layer: this}];
        }, current);
    }

    // Data management
    // TODO: add a system to not call the hook if nothing changed for a given stack (menu/field/content)
    /**
     * Retrieves the menu data
     * @param hook The data hook to subscribe to changes
     * @returns The menu data of this layer
     */
    public getMenuData(hook?: IDataHook): IUILayerMenuData[] {
        return [];
    }

    /**
     * Retrieves the field data
     * @param hook The data hook to subscribe to changes
     * @returns The field data of this layer
     */
    public getFieldData(hook?: IDataHook): IUILayerFieldData[] {
        return [];
    }

    /**
     * Retrieves the content data
     * @param hook The data hook to subscribe to changes
     * @returns The content data of this layer
     */
    public getContentData(hook?: IDataHook): IUILayerContentData[] {
        return [];
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
