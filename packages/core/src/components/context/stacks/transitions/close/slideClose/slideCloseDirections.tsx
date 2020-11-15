import React, {FC} from "react";
import {ISlideCloseTransitionProps} from "../_types/ISlideCloseTransitionProps";
import {SlideCloseTransition} from "./SlideCloseTransition";

/**
 * Slide close transition to the right
 */
export const SlideRightCloseTransition: FC<Omit<
    ISlideCloseTransitionProps,
    "direction"
>> = props => <SlideCloseTransition {...props} direction="right" />;

/**
 * Slide close transition to the left
 */
export const SlideLeftCloseTransition: FC<Omit<
    ISlideCloseTransitionProps,
    "direction"
>> = props => <SlideCloseTransition {...props} direction="left" />;

/**
 * Slide close transition upwards
 */
export const SlideUpCloseTransition: FC<Omit<
    ISlideCloseTransitionProps,
    "direction"
>> = props => <SlideCloseTransition {...props} direction="up" />;

/**
 * Slide close transition downwards
 */
export const SlideDownCloseTransition: FC<Omit<
    ISlideCloseTransitionProps,
    "direction"
>> = props => <SlideCloseTransition {...props} direction="down" />;
