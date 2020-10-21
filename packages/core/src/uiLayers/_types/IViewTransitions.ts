import {IChangeTransition} from "../../components/context/stacks/transitions/change/_types/IChangeTransition";
import {ICloseTransition} from "../../components/context/stacks/transitions/close/_types/ICloseTransition";
import {IOpenTransition} from "../../components/context/stacks/transitions/open/_types/IOpenTransition";

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
