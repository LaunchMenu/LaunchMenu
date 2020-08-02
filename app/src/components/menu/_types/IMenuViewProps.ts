import {IMenu} from "../../../menus/menu/_types/IMenu";

export type IMenuViewProps = {
    /** The menu to visualize */
    menu: IMenu;
    /** The amount of padding around the menu such that cursor items are scrolled to be outside said padding */
    cursorItemScrollPadding?: number;

    /** The duration of the cursor follow scroll animation */
    cursorItemScrollDuration?: {
        /** The animation duration if the item is far away (jump from top to bottom or bottom to top) */
        far: number;
        /** The animation duration if the item is close (a couple of items up/down) */
        near: number;
    };

    /** The duration for the smooth mouse wheel scroll animation */
    smoothScrollDuration?: number;
};
