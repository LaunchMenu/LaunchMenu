import {ICloseTransitionProps} from "./ICloseTransitionProps";

export type ISlideCloseTransitionProps = {
    /** The duration in milliseconds */
    duration?: number;
    /** The direction to slide in */
    direction?: "left" | "right" | "up" | "down";
} & ICloseTransitionProps;
