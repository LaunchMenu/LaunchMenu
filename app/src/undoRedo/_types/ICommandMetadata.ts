import {IMenuItem} from "../../menus/items/_types/IMenuItem";

/**
 * The data to represent a command in the UI
 */
export type ICommandMetadata = {
    /** The name of the command */
    name: string;

    /** The view that can be shown in a menu */
    menuItem?: IMenuItem;
};
