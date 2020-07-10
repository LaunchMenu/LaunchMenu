import {IOpenTransition} from "../open/_types/IOpenTransition";
import {IChangeTransition} from "../change/_types/IChangeTransition";
import {ICloseTransition} from "../close/_types/ICloseTransition";

/**
 * The properties for the transition component
 */
export type ITransitionProps = {
    /** The child to transition to and from */
    children?: JSX.Element;
    /** A callback for when the open transition finishes */
    onOpen?: () => void;
    /** A callback for when the close transition finishes */
    onClose?: () => void;
    /** A callback for when the change transition finishes */
    onChange?: () => void;
    /** Whether to hide the element without affecting the animation */
    hidden?: boolean;
    /** The opening transition type */
    OpenTransitionComp?: IOpenTransition;
    /** The changing transition type */
    ChangeTransitionComp?: IChangeTransition;
    /** The closing transition type */
    CloseTransitionComp?: ICloseTransition;
};
