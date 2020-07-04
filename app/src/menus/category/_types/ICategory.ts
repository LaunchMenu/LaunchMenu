import {IMenuItem} from "../../items/_types/IMenuItem";

/**
 * A category to group menu items in menus
 */
export type ICategory = {
    /** The name of the category */
    name: string;
    /** The description of the category */
    description: string;
    /** The menu item to represent the category */
    item: IMenuItem;
};
