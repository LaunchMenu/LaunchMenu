import {IOpenTransitionProps} from "./IOpenTransitionProps";

export type ISlideOpenTransitionProps = {
    /** The duration in milliseconds */
    duration?: number;
    /** The direction to slide in */
    direction?: "left" | "right" | "up" | "down";
} & IOpenTransitionProps;
