import React, {ReactNode} from "react";
import {Content} from "../../../content/Content";
import {IUILayerContentData} from "../../../uiLayers/_types/IUILayerContentData";
import {InstantChangeTransition} from "../../context/stacks/transitions/change/InstantChangeTransition";
import {SlideUpCloseTransition} from "../../context/stacks/transitions/close/slideClose/slideCloseDirections";
import {SlideDownOpenTransition} from "../../context/stacks/transitions/open/slideOpen/slideOpenDirectionts";
import {ErrorMessage} from "./ErrorMessage";
import {v4 as uuid} from "uuid";
import {ContentView} from "../ContentView";
import {createContentKeyHandler} from "../../../content/interaction/keyHandler/createContentKeyHandler";
import {IIOContext} from "../../../context/_types/IIOContext";
import {FadeOpenTransition} from "../../context/stacks/transitions/open/FadeOpenTransition";
import {FadeCloseTransition} from "../../context/stacks/transitions/close/FadeCloseTransition";

/**
 * Returns ui layer content data that handles errors and their animations in an appropriate way
 * @param error The error to be displayed
 * @param context The context for key inputs
 * @returns The item to be added to the view stack
 */
export function createContentError(
    error: ReactNode,
    context: IIOContext
): IUILayerContentData {
    const content = new Content(<ErrorMessage padding="medium">{error}</ErrorMessage>);
    return {
        ID: uuid(),
        content,
        contentView: {
            view: <ContentView content={content} plain />,
            transparent: true,
            transitions: {
                Change: InstantChangeTransition,
                Open: FadeOpenTransition,
                Close: FadeCloseTransition,
            },
        },
        contentHandler: createContentKeyHandler(content, context),
    };
}
