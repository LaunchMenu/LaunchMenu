import {IMenu} from "../../../../menus/menu/_types/IMenu";

/**
 * A menu change listener object for items
 */
export type IMenuChangeable = {
    /**
     * Informs about changes of the menu the item is added to
     * @param menu The menu the item got added to or removed from
     * @param added Whether the item just got added or removed
     */
    (menu: IMenu, added: boolean): void;
};
