import {IChangeTransitionProps} from "./IChangeTransitionProps";

export type ISlideChangeTransitionProps = {
    /** The duration in milliseconds */
    duration?: number;
    /** The direction to slide in */
    direction?: "left" | "right" | "up" | "down";
} & IChangeTransitionProps;
