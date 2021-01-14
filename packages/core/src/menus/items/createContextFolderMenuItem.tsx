import {IRecursiveSearchChildren} from "../../actions/types/search/tracedRecursiveSearch/_types/IRecursiveSearchChildren";
import {ISubscribable} from "../../utils/subscribables/_types/ISubscribable";
import {createFolderMenuItem} from "./createFolderMenuItem";
import {IFolderMenuItemData} from "./_types/IFolderMenuItemData";
import {IMenuItem} from "./_types/IMenuItem";

/**
 * Creates a new folder menu item for within a context menu.
 * Behaves the same as `createFolderMenuItem` but enables `closeOnExecute` and `forwardKeyEvents` by default.
 * @param data The data to create the menu item from
 * @returns The folder menu item, including the children
 */
export function createContextFolderMenuItem<
    T extends {[key: string]: IMenuItem} | ISubscribable<IMenuItem[]>,
    S extends {[key: string]: IMenuItem} | IRecursiveSearchChildren = T extends {
        [key: string]: IMenuItem;
    }
        ? T
        : IRecursiveSearchChildren
>(data: IFolderMenuItemData<T, S>): IMenuItem & {children: T} {
    return createFolderMenuItem({
        searchIcon: "contextMenu",
        closeOnExecute: true,
        forwardKeyEvents: true,
        ...data,
    });
}
