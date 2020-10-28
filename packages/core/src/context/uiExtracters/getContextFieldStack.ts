import {IDataHook} from "model-react";
import {IViewStackItem} from "../../uiLayers/_types/IViewStackItem";
import {IIdentifiedItem} from "../../_types/IIdentifiedItem";
import {IIOContext} from "../_types/IIOContext";

/**
 * Retrieves the fields UI
 * @param context The context to extract the fields from
 * @param hook The data hook to subscribe to changes
 * @returns The context's fields
 */
export function getContextFieldStack(
    context: IIOContext,
    hook?: IDataHook
): IIdentifiedItem<IViewStackItem>[] {
    return context
        .getUI(hook)
        .flatMap(layer =>
            layer.getFieldData(hook).map(({ID, fieldView}) => ({ID, value: fieldView}))
        );
}
