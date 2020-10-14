import {IChangeTransition} from "../../components/stacks/transitions/change/_types/IChangeTransition";
import {ICloseTransition} from "../../components/stacks/transitions/close/_types/ICloseTransition";
import {IOpenTransition} from "../../components/stacks/transitions/open/_types/IOpenTransition";

/**
 * The transition components to use to change the views
 */
export type IViewTransitions = {
    /** The opening transition type */
    Open?: IOpenTransition;
    /** The changing transition type */
    Change?: IChangeTransition;
    /** The closing transition type */
    Close?: ICloseTransition;
};
