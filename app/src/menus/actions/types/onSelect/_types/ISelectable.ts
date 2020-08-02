import {IMenu} from "../../../../menu/_types/IMenu";

/**
 * A select listener object for items
 */
export type ISelectable = {
    /**
     * Informs about selection changes regarding this item in a menu
     * @param selected Whether the item was just selected or deselected
     * @param menu  The menu in which this item was either selected or deselected
     */
    onSelect: (selected: boolean, menu: IMenu) => void;
};
