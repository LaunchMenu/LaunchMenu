import {IDataHook} from "model-react";
import {IIOContext} from "../_types/IIOContext";
import {IIdentifiedItem} from "../../_types/IIdentifiedItem";
import {IViewStackItem} from "../../uiLayers/_types/IViewStackItem";

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
    return context.getUI(hook).flatMap(layer =>
        layer
            .getContentData(hook)
            .map(({ID, contentView}) => ({ID, value: contentView}))
            .filter((m): m is IIdentifiedItem<IViewStackItem> => !!m.value)
    );
}
