import {IDataHook} from "model-react";
import {IUILayer} from "../../uiLayers/_types/IUILayer";
import {IIOContext} from "../_types/IIOContext";

/**
 * Retrieves the top layer of a context
 * @param context The context to extract the layer from
 * @param hook The data hook to subscribe to changes
 * @returns The context's top layer
 */
export function getContextTopLayer(context: IIOContext, hook?: IDataHook): IUILayer {
    const layers = context.getUI(hook);
    return layers[layers.length - 1] ?? null;
}
