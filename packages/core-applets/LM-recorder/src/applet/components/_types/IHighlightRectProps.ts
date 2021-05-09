import {IBoxProps} from "@launchmenu/core";
import {ReactNode} from "react";
import {IRect} from "../../overlays/window/_types/IRect";

/** The props for a highlight rectangle */
export type IHighlightRectProps = Omit<
    IHighlightRectJSONProps,
    "comment" | "area" | "visible"
> & {
    /** The area to highlight */
    area: IHighlightArea;
    /** The sections that are visible (used to determine the highlight area coords) */
    visible?: IHighlightAreaNames[];
    /** THe comment to show about the message */
    comment?: ReactNode;
    /** Props to pass to the comment element */
    commentProps?: IBoxProps;
};

/** The props for a highlight rectangle that are just JSON*/
export type IHighlightRectJSONProps = {
    /** The area to highlight */
    area: IRect;
    /** THe duration of the rectangle transitions */
    transitionDuration?: number;
    /** THe comment to show about the message */
    comment?: string;
    /** The side to show the comment at */
    commentSide?: "left" | "right" | "up" | "down";
};

export type IHighlightArea = IRect | IHighlightAreaNames;

// TODO: consider what's visible in the UI
export type IHighlightAreaNames = "textField" | "content" | "menu" | "path";
