import {IDataHook} from "model-react";
import {IUILayer} from "../../uiLayers/_types/IUILayer";
import {IViewStackItem} from "../../uiLayers/_types/IViewStackItem";
import {IIdentifiedItem} from "../../_types/IIdentifiedItem";
import {IIOContext} from "../_types/IIOContext";

/**
 * Retrieves the ui stack data
 * @param context The context to extract the ui from
 * @param getUI The function to extract the UI
 * @param hook The hook to subscribe to change
 * @returns The UI retrieved from the context
 */
export function getUIStack(
    context: IIOContext,
    getUI: (
        layer: IUILayer
    ) => {view: IIdentifiedItem<IViewStackItem>; overlayGroup?: Symbol}[],
    hook?: IDataHook
): IIdentifiedItem<IViewStackItem>[] {
    return context
        .getUI(hook)
        .flatMap(getUI)
        .reduce(
            ({views, lastGroup, visible}, {view, overlayGroup}) => {
                // If no group is specified, or it's different from the last group, add the view
                if (!overlayGroup || (lastGroup != overlayGroup && visible))
                    views.push(view); // Mutable push is faster than concatenation

                return {
                    views,
                    lastGroup: overlayGroup,
                    // Overlay views don't alter visibility, other items do
                    visible: overlayGroup ? visible : !("close" in view.value),
                };
            },
            {
                views: [] as IIdentifiedItem<IViewStackItem>[],
                lastGroup: undefined as undefined | Symbol,
                /** Whether the content so far is visible (not a closed view with possibly a number of overlays on top) */
                visible: true,
            }
        ).views;
}
