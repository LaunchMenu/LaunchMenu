import {ReactNode} from "react";

/**
 * The props for a change transition component
 */
export type IChangeTransitionProps = {
    /** The callback when the transition finishes */
    onComplete?: () => void;
    /** The children to transition through to the last child */
    children: ReactNode[];
    /** Whether to activate the transition, defaults to true */
    activate?: boolean;
};
