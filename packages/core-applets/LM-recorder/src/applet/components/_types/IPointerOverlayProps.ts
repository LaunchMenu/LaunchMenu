import {IBoxProps, IThemeColor} from "@launchmenu/core";
import {IRect} from "../../overlays/window/_types/IRect";

/** The props for the overlay pointer */
export type IPointerOverlayProps = IBoxProps & {
    /** The point to point at */
    pointAt: {
        /** The direction to point towards */
        direction: IDirection;
        /** Where the point is relative to the pointer, defaults to 0.5 (in the middle) */
        pointerOffsetFrac?: number;
    } & (
        | {
              /** The x coordinate to point at */
              x: number;
              /** The y coordinate to point at */
              y: number;
          }
        | (IRect & {
              /** The offset fraction for where in the rectangle to point at */
              areaOffsetFrac?: number;
          })
    );
    /** The opacity of the background */
    backgroundOpacity?: number;
    /** The number of pixels to blur */
    blur?: number;
    /** Properties to pass to the inner container */
    innerProps?: IBoxProps;
    /** Shadow for the element */
    shadow?: string;
    /** The size of the arrow in number of pixels  */
    arrowSize?: number;
    /** The width of the blue outline of the arrow */
    arrowBorderWidth?: number;
    /** The color for the arrow */
    arrowColor?: IThemeColor;
};

export type IDirection = "left" | "right" | "up" | "down";
