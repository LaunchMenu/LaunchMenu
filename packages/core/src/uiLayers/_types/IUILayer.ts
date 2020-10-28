import {IDataHook} from "model-react";
import {IUILayerMenuData} from "./IUILayerMenuData";
import {IUILayerPathNode} from "./IUILayerPathNode";
import {IUILayerFieldData} from "./IUILayerFieldData";
import {IUILayerContentData} from "./IUILayerContentData";
import {IKeyEventListener} from "../../keyHandler/_types/IKeyEventListener";
import {IIOContext} from "../../context/_types/IIOContext";

/**
 * The interface for a UI Layer
 */
export type IUILayer = {
    /**
     * A override for the view to use to represent this layer's path
     */
    pathView?: JSX.Element;
    /**
     * Retrieves the path to show to the user representing this layer
     * @param hook The data hook to subscribe to changes
     * @returns The path
     */
    getPath(hook?: IDataHook): IUILayerPathNode[];
    /**
     * Retrieves the menu data
     * @param hook The data hook to subscribe to changes
     * @returns The menu data of this layer
     */
    getMenuData(hook?: IDataHook): IUILayerMenuData[];
    /**
     * Retrieves the field data
     * @param hook The data hook to subscribe to changes
     * @returns The field data of this layer
     */
    getFieldData(hook?: IDataHook): IUILayerFieldData[];
    /**
     * Retrieves the content data
     * @param hook The data hook to subscribe to changes
     * @returns The content data of this layer
     */
    getContentData(hook?: IDataHook): IUILayerContentData[];
    /**
     * Retrieves the key listener data
     * @param hook The data hook to subscribe to changes
     * @returns The key listener data of this layer
     */
    getKeyHandlers(hook?: IDataHook): IKeyEventListener[];
    /**
     * A callback for when the UI layer is opened
     * @param context The context that this layer was opened in
     * @param close A method to close this layer from the given context
     * @returns A callback for when this layer is closed (both when invoked by our close call, or closed external)
     */
    onOpen(
        context: IIOContext,
        close: () => void
    ): void | (() => void | Promise<void>) | Promise<void | (() => void | Promise<void>)>;
};
