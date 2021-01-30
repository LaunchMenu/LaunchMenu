import {IDataHook, waitFor} from "model-react";
import {ReactElement} from "react";
import {IIOContext} from "../../../../context/_types/IIOContext";
import {IMenuItem} from "../../../../menus/items/_types/IMenuItem";
import {ProxiedMenu} from "../../../../menus/menu/ProxiedMenu";
import {IThemeIcon} from "../../../../styling/theming/_types/IBaseTheme";
import {UILayer} from "../../../../uiLayers/standardUILayer/UILayer";
import {getHooked} from "../../../../utils/subscribables/getHooked";
import {createContextAction} from "../../../contextMenuAction/createContextAction";
import {executeAction} from "../executeAction";
import {sequentialExecuteHandler} from "../sequentialExecuteHandler";
import {IOpenMenuExecuteData} from "./_types/IOpenMenuExecuteData";
import {IUILayerFieldData} from "../../../../uiLayers/_types/IUILayerFieldData";
import {IUILayerContentData} from "../../../../uiLayers/_types/IUILayerContentData";

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
        icon: "open",
    },
    override: executeAction,
    parents: [sequentialExecuteHandler],
    core: (data: IOpenMenuExecuteData[]) => {
        const childrenGetter = (h?: IDataHook) =>
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
                // Find the combined path name
                const pathName =
                    data.reduce(
                        (cur, d) =>
                            "pathName" in d
                                ? cur
                                    ? `${cur}, ${d.pathName}`
                                    : d.pathName
                                : cur,
                        ""
                    ) || ".";

                // Find the most requested icon
                const iconCounts = new Map<IThemeIcon | ReactElement, number>();
                data.forEach(item => {
                    if ("pathName" in item && item.searchIcon) {
                        const currentCount = iconCounts.get(item.searchIcon) || 0;
                        iconCounts.set(item.searchIcon, currentCount + 1);
                    }
                });
                const [count, icon] = [...iconCounts.entries()].reduce(
                    ([bestCount, bestItem], [item, count]) =>
                        count > bestCount ? [count, item] : [bestCount, bestItem],
                    [0, undefined] as [number, IThemeIcon | ReactElement | undefined]
                );

                // Retrieve any field and or content data
                const fields = data
                    .map(item => ("field" in item ? item.field : undefined))
                    .filter((item): item is IUILayerFieldData => !!item)
                    .filter((value, index, list) => list.indexOf(value) >= index);
                const contents = data
                    .map(item => ("content" in item ? item.content : undefined))
                    .filter((item): item is IUILayerContentData => !!item)
                    .filter((value, index, list) => list.indexOf(value) >= index);

                // Create the menu
                const menu = new ProxiedMenu(context, childrenGetter);
                context.open(
                    new UILayer(
                        [
                            (context, close) => ({
                                menu,
                                icon,
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
                            ...fields,
                            ...contents,
                        ],
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
