import {ReactNode} from "react";

/**
 * The props for a close transition component
 */
export type ICloseTransitionProps = {
    /** The callback when the transition finishes */
    onComplete?: () => void;
    /** The child to close */
    children: ReactNode;
    /** Whether to activate the transition, defaults to true */
    activate?: boolean;
};
