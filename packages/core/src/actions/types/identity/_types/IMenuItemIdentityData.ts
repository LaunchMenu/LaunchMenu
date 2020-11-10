import {IMenuItem} from "../../../../menus/items/_types/IMenuItem";
import {IUUID} from "../../../../_types/IUUID";

/** The identity data for items */
export type IMenuItemIdentityData = {ID: IUUID; item: IMenuItem | (() => IMenuItem)};
