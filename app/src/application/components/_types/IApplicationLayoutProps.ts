import {IViewStack} from "../../../stacks/viewStack/_types/IViewStack";

/**
 * The props that can be applied to an application layout
 */
export type IApplicationLayoutProps = {
    /** The stack of field views to be rendered */
    fieldStack: IViewStack;
    /** The stack of menu views to be rendered */
    menuStack: IViewStack;
    /** The stack of content views to be rendered */
    contentStack: IViewStack;
    /** The default open/close transition duration */
    defaultTransitionDuration?: number;
    /** The width of the menu section expressed as a fraction of the total width */
    menuWidthFraction?: number;
    /** The height of the field */
    fieldHeight?: number;
};
