import {IDataHook} from "model-react";
import {IMenuItem} from "../../../menus/items/_types/IMenuItem";
import {ProxiedMenu} from "../../../menus/menu/ProxiedMenu";
import {UILayer} from "../../../uiLayers/standardUILayer/UILayer";
import {ICommand} from "../../../undoRedo/_types/ICommand";
import {getHooked} from "../../../utils/subscribables/getHooked";
import {createContextAction} from "../../contextMenuAction/createContextAction";
import {executeAction} from "./executeAction";
import {sequentialExecuteHandler} from "./sequentialExecuteHandler";
import {IExecutable} from "./_types/IExecutable";
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
 * An execute handler to open menus
 */
export const openMenuExecuteHandler = createContextAction({
    name: "Open menu",
    override: executeAction,
    parents: [sequentialExecuteHandler],
    core: (data: IOpenMenuExecuteData[]) => {
        const execute: IExecutable = async ({context, preventCallback}) => {
            const callback = preventCallback?.();
            return new Promise<ICommand | void>(res => {
                const childrenGetter = (h: IDataHook) =>
                    data.flatMap(d =>
                        "items" in d ? getHooked(d.items, h) : getHooked(d, h)
                    );

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
        };

        return {
            execute,
            children: [sequentialExecuteHandler.createBinding(execute)],
        };
    },
});
