import {sequentialExecuteHandler} from "./sequentialExecuteHandler";
import {IMenuItem} from "../../../items/_types/IMenuItem";
import {ProxiedMenu} from "../../../menu/ProxiedMenu";
import {getHooked} from "../../../../utils/subscribables/getHooked";
import {IDataHook} from "model-react";
import {UILayer} from "../../../../uiLayers/standardUILayer/UILayer";
import {IOpenMenuExecuteData} from "./_types/IOpenMenuExecuteData";

/**
 * Determines whether one of the passed item comes from a set of items that indicates to be closed on execute
 * @param data The sets of items
 * @param items The items to test for
 * @returns Whether any items are from a closing set
 */
const containsClosingItem = (data: IOpenMenuExecuteData[], items: IMenuItem[]) => {
    return data.reduce((cur, d) => {
        if (cur) return true;
        if ("closeOnExecute" in d && d.closeOnExecute) {
            const containsItems = items.reduce(
                (cur, item) => getHooked(d.items).includes(item),
                false
            );
            if (containsItems) return true;
        }
        return false;
    }, false);
};

/**
 * An execution handler to open menus
 */
export const openMenuExecuteHandler = sequentialExecuteHandler.createHandler(
    (data: IOpenMenuExecuteData[]) => ({
        execute: async ({context, preventCallback}) => {
            const callback = preventCallback?.();
            return new Promise(res => {
                const childrenGetter = (h: IDataHook) =>
                    data
                        .map(d =>
                            "items" in d ? getHooked(d.items, h) : getHooked(d, h)
                        )
                        .flat();

                const pathName =
                    data.reduce(
                        (cur, d) =>
                            "pathName" in d
                                ? cur
                                    ? `${cur}/${d.pathName}`
                                    : d.pathName
                                : cur,
                        ""
                    ) || ".";

                const menu = new ProxiedMenu(context, childrenGetter);
                context.open(
                    new UILayer(
                        (context, close) => ({
                            menu,
                            onExecute: items => {
                                if (containsClosingItem(data, items)) close();
                                callback?.();
                            },
                            onClose: res,
                        }),
                        pathName
                    )
                );
            });
        },
    })
);
