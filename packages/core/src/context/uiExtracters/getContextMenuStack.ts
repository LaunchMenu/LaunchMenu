import {IDataHook} from "model-react";
import {IViewStackItem} from "../../uiLayers/_types/IViewStackItem";
import {IIdentifiedItem} from "../../_types/IIdentifiedItem";
import {IIOContext} from "../_types/IIOContext";

/**
 * Retrieves the menus UI
 * @param context The context to extract the menus from
 * @param hook The data hook to subscribe to changes
 * @returns The context's menus
 */
export function getContextMenuStack(
    context: IIOContext,
    hook?: IDataHook
): IIdentifiedItem<IViewStackItem>[] {
    return context
        .getUI(hook)
        .flatMap(layer =>
            layer.getMenuData(hook).map(({ID, menuView}) => ({ID, value: menuView}))
        );
}
