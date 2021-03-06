import React from "react";
import {SlideChangeTransition} from "../components/context/stacks/transitions/change/slideChange/SlideChangeTransition";
import {FadeCloseTransition} from "../components/context/stacks/transitions/close/FadeCloseTransition";
import {FadeOpenTransition} from "../components/context/stacks/transitions/open/FadeOpenTransition";
import {FillBox} from "../components/FillBox";
import {IViewStackItem} from "./_types/IViewStackItem";

/**
 * The standard overlay group, making sure that overlays aren't visually stacked
 */
export const standardOverlayGroup = Symbol("overlay");

/**
 * A view to use in UILayers when no data is specified for a given section
 */
export const UIMissingView: IViewStackItem = {
    transparent: true,
    transitions: {
        Open: FadeOpenTransition,
        Change: SlideChangeTransition,
        Close: FadeCloseTransition,
    },
    view: <FillBox backgroundColor="bgTertiary" opacity={0.6} />,
};
