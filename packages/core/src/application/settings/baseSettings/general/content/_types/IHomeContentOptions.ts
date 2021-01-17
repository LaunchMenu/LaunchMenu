import {ReactElement} from "react";
import {IMenuItem} from "../../../../../../menus/items/_types/IMenuItem";
import {IUUID} from "../../../../../../_types/IUUID";

/** An option for the home content */
export type IHomeContentOption = {
    /** The ID of the option */
    ID: IUUID;
    /** The view to visualize the option in a menu to choose it */
    view: IMenuItem;
    /** The home content to show */
    content: ReactElement;
};
