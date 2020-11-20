import {IDataHook} from "model-react";
import {IViewStackItem} from "../../uiLayers/_types/IViewStackItem";
import {IIdentifiedItem} from "../../_types/IIdentifiedItem";
import {IIOContext} from "../_types/IIOContext";
import {getUIStack} from "./getUIStack";

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
    return getUIStack(
        context,
        layer =>
            layer.getMenuData(hook).map(({ID, menuView, overlayGroup}) => ({
                view: {ID, value: menuView},
                overlayGroup,
            })),
        hook
    );
}
