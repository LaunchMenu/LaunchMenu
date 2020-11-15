import React, {FC} from "react";
import {ISlideOpenTransitionProps} from "../_types/ISlideOpenTransitionProps";
import {SlideOpenTransition} from "./SlideOpenTransition";

/**
 * Slide open transition to the right
 */
export const SlideRightOpenTransition: FC<Omit<
    ISlideOpenTransitionProps,
    "direction"
>> = props => <SlideOpenTransition {...props} direction="right" />;

/**
 * Slide open transition to the left
 */
export const SlideLeftOpenTransition: FC<Omit<
    ISlideOpenTransitionProps,
    "direction"
>> = props => <SlideOpenTransition {...props} direction="left" />;

/**
 * Slide open transition upwards
 */
export const SlideUpOpenTransition: FC<Omit<
    ISlideOpenTransitionProps,
    "direction"
>> = props => <SlideOpenTransition {...props} direction="up" />;

/**
 * Slide open transition downwards
 */
export const SlideDownOpenTransition: FC<Omit<
    ISlideOpenTransitionProps,
    "direction"
>> = props => <SlideOpenTransition {...props} direction="down" />;
