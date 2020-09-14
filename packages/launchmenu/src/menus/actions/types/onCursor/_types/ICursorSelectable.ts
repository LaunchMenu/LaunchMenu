import {IMenu} from "../../../../menu/_types/IMenu";

/**
 * A cursor select listener object for items
 */
export type ICursorSelectable = {
    /**
     * Informs about cursor selection changes regarding this item in a menu
     * @param cursorSelected Whether the item was just selected or deselected
     * @param menu  The menu in which this item was either selected or deselected
     */
    onCursor: (cursorSelected: boolean, menu: IMenu) => void;
};
