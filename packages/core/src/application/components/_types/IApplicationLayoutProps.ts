import {IIOContext} from "../../../context/_types/IIOContext";

/**
 * The props that can be applied to an application layout
 */
export type IApplicationLayoutProps = {
    /** The context to get all the data from */
    context: IIOContext;
    /** The default open/close transition duration */
    defaultTransitionDuration?: number;
    /** The width of the menu section expressed as a fraction of the total width */
    menuWidthFraction?: number;
    /** The height of the field */
    fieldHeight?: number;
};
