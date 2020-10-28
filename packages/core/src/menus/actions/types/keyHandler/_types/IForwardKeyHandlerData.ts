import {IMenuItem} from "../../../../items/_types/IMenuItem";
import {IMenuItemActionBindings} from "../../../_types/IMenuItemActionBindings";

/**
 * Data used by the forward key event handler
 */
export type IForwardKeyHandlerData = {
    targets: (IMenuItem | IMenuItemActionBindings)[];
};
