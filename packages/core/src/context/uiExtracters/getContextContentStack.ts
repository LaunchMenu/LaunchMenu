import {IDataHook} from "model-react";
import {IIOContext} from "../_types/IIOContext";
import {IIdentifiedItem} from "../../_types/IIdentifiedItem";
import {IViewStackItem} from "../../uiLayers/_types/IViewStackItem";
import {getUIStack} from "./getUIStack";

/**
 * Retrieves the contents UI
 * @param context The context to extract the contents from
 * @param hook The data hook to subscribe to changes
 * @returns The context's contents
 */
export function getContextContentStack(
    context: IIOContext,
    hook?: IDataHook
): IIdentifiedItem<IViewStackItem>[] {
    return getUIStack(
        context,
        layer =>
            layer.getContentData(hook).flatMap(({ID, contentView, overlayGroup}) =>
                contentView
                    ? {
                          view: {ID, value: contentView},
                          overlayGroup,
                      }
                    : []
            ),
        hook
    );
}
