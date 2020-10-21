import React, {ReactNode} from "react";
import {IViewStackItem} from "../../../uiLayers/_types/IViewStackItem";
import {InstantChangeTransition} from "../../context/stacks/transitions/change/InstantChangeTransition";
import {ContentErrorMessage} from "./ContentErrorMessage";

/**
 * Returns a stack view item that handles the animations in an appropriate way
 * @param error The error to be displayed
 * @returns The item to be added to the view stack
 */
export function createContentError(error: ReactNode): IViewStackItem {
    return {
        view: <ContentErrorMessage>{error}</ContentErrorMessage>,
        transparent: true,
        transitions: {Change: InstantChangeTransition},
    };
}
