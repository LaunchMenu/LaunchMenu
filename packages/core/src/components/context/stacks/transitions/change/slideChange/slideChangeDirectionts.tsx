import React, {FC} from "react";
import {ISlideChangeTransitionProps} from "../_types/ISlideChangeTransitionProps";
import {SlideChangeTransition} from "./SlideChangeTransition";

/**
 * Slide change transition to the right
 */
export const SlideRightChangeTransition: FC<Omit<
    ISlideChangeTransitionProps,
    "direction"
>> = props => <SlideChangeTransition {...props} direction="right" />;

/**
 * Slide change transition to the left
 */
export const SlideLeftChangeTransition: FC<Omit<
    ISlideChangeTransitionProps,
    "direction"
>> = props => <SlideChangeTransition {...props} direction="left" />;

/**
 * Slide change transition upwards
 */
export const SlideUpChangeTransition: FC<Omit<
    ISlideChangeTransitionProps,
    "direction"
>> = props => <SlideChangeTransition {...props} direction="up" />;

/**
 * Slide change transition downwards
 */
export const SlideDownChangeTransition: FC<Omit<
    ISlideChangeTransitionProps,
    "direction"
>> = props => <SlideChangeTransition {...props} direction="down" />;
