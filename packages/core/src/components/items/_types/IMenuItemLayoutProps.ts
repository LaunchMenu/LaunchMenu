import {ReactNode} from "react";

/** The props for the standard menu item layout */
export type IMenuItemLayoutProps = {
    /*Y The item name to show */
    name: ReactNode;
    /** The icon to show for the icon*/
    icon?: ReactNode;
    /** The item's content */
    description?: ReactNode;
    /** Some value associated with the node to display */
    value?: ReactNode;
    /** The shortcut data to show */
    shortcut?: ReactNode;
};
