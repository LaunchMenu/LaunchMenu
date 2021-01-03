import {IDataHook} from "model-react";
import {IIOContext} from "../../../context/_types/IIOContext";
import {IMenuItem} from "../../../menus/items/_types/IMenuItem";
import {ProxiedMenu} from "../../../menus/menu/ProxiedMenu";
import {UILayer} from "../../../uiLayers/standardUILayer/UILayer";
import {waitFor} from "../../../utils/modelReact/waitFor";
import {getHooked} from "../../../utils/subscribables/getHooked";
import {createContextAction} from "../../contextMenuAction/createContextAction";
import {executeAction} from "./executeAction";
import {sequentialExecuteHandler} from "./sequentialExecuteHandler";
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
                (cur, item) => cur || getHooked(d.items).includes(item),
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
    contextItem: {
        priority: executeAction.priority,
    },
    override: executeAction,
    parents: [sequentialExecuteHandler],
    core: (data: IOpenMenuExecuteData[]) => {
        const childrenGetter = (h: IDataHook = null) =>
            data.flatMap(d => ("items" in d ? getHooked(d.items, h) : getHooked(d, h)));

        /**
         * Executes the open function
         * @param data The data of how to handle the opening
         * @returns A promise that resolves once the menu is closed again
         */
        const execute = async ({
            context,
            preventCallback,
            focus,
        }: {
            /** The context to open the menu in */
            context: IIOContext;
            /** A function to indicate the execution success should be suspended, until the second function is called */
            preventCallback?: () => () => void;
            /** The item to focus on in the menu */
            focus?: IMenuItem;
        }) => {
            const callback = preventCallback?.();
            return new Promise<void>(res => {
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
                                if (containsClosingItem(data, items)) {
                                    close();
                                    /*
                                        TODO: always execute callback, but add data for whether to close the menu
                                        in order to generalize it. 
                                        Rethink this system in general since it's quite confusing atm.
                                     */
                                    callback?.();
                                }
                            },
                            onClose: res,
                        }),
                        {path: pathName}
                    )
                );

                // Focus the item
                if (focus)
                    waitFor(h => {
                        const items = menu.getItems(h);
                        if (items.includes(focus)) {
                            menu.setCursor(focus);
                            return true;
                        }
                        return false;
                    });
            });
        };

        return {
            execute,
            result: {
                execute,
                getItems: childrenGetter as {
                    /**
                     * Retrieves the items that would be shown in the menu
                     * @param hook The data hook to subscribe to changes
                     * @returns The items for the menu
                     */
                    (hook?: IDataHook): IMenuItem[];
                },
            },
            children: [sequentialExecuteHandler.createBinding(execute)],
        };
    },
});
