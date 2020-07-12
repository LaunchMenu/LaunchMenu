import {ReactNode} from "react";

/**
 * The props for an open transition component
 */
export type IOpenTransitionProps = {
    /** The callback when the transition finishes */
    onComplete?: () => void;
    /** The child to open */
    children: ReactNode;
    /** Whether to activate the transition, defaults to true */
    activate?: boolean;
};
