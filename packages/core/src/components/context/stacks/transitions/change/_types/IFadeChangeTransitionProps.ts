import {IChangeTransitionProps} from "./IChangeTransitionProps";

export type IFadeChangeTransitionProps = {
    /** The duration in milliseconds */
    duration?: number;
} & IChangeTransitionProps;
