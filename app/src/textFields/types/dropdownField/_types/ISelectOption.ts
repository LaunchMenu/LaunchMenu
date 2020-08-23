import {IMenuItem} from "../../../../menus/items/_types/IMenuItem";

/**
 * Options for the select input
 */
export type ISelectOption<T> = {
    /** The view for the option */
    view: IMenuItem;
    /** The value for the option */
    value: T;
    /** Whether this option should not be selectable */
    disabled?: boolean;
};
