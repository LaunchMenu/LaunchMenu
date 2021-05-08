import {IBoxProps} from "@launchmenu/core";
import {ReactNode} from "react";
import {IRect} from "../../overlays/window/_types/IRect";

export type IHighlightRectProps = {
    /** The area to highlight */
    area: IHighlightArea;
    /** The sections that are visible (used to determine the highlight area coords) */
    visible?: IHighlightAreaNames[];
    /** THe duration of the rectangle transitions */
    transitionDuration?: number;
    /** THe comment to show about the message */
    comment?: ReactNode;
    /** The side to show the comment at */
    commentSide?: "left" | "right" | "up" | "down";
    /** Props to pass to the comment element */
    commentProps?: IBoxProps;
};

export type IHighlightArea = IRect | IHighlightAreaNames;

// TODO: consider what's visible in the UI
export type IHighlightAreaNames = "textField" | "content" | "menu" | "path";
