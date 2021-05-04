import React from "react";
import {IBoxProps, IThemeColor, mergeStyles, useTheme} from "@launchmenu/core";
import {FC} from "react";
import {Overlay} from "./Overlay";
import {useResizeDetector} from "react-resize-detector";
import {IPointerOverlayProps} from "./_types/IPointerOverlayProps";

/** An overlay with a pointer to point at something */
export const PointerOverlay: FC<IPointerOverlayProps> = ({
    children,
    blur = 2,
    css,
    background = "bgTertiary",
    arrowColor = "primary",
    backgroundOpacity = 0.8,
    arrowSize = 10,
    borderRadius = "medium",
    arrowBorderWidth = 3,
    pointAt: {x, y, direction, pointerOffsetFrac = 0.5, ...pointRest},
    ...props
}) => {
    const theme = useTheme();
    const borderRadiusSize = theme.radius[borderRadius];
    const slidePadding = arrowSize + borderRadiusSize;

    const dir = directionalProps[direction];
    if ("width" in pointRest) {
        let areaOffsetFrac = pointRest.areaOffsetFrac ?? pointerOffsetFrac;
        if (direction == "left") x += pointRest.width;
        if (direction == "up") y += pointRest.height;
        if (dir.offset == "left")
            x += slidePadding + (pointRest.width - slidePadding * 2) * areaOffsetFrac;
        if (dir.offset == "top")
            y += slidePadding + (pointRest.height - slidePadding * 2) * areaOffsetFrac;
    }

    const {ref, width, height} = useResizeDetector({});
    const offsetPer = Math.round(pointerOffsetFrac * 100);

    const slideHeight = height ? height - slidePadding * 2 : 0;
    const slideWidth = width ? width - slidePadding * 2 : 0;

    return (
        <Overlay
            {...props}
            blur={blur}
            overflow="visible"
            background={background}
            borderRadius={borderRadius}
            backgroundOpacity={backgroundOpacity}
            backgroundProps={{elRef: ref}}
            css={mergeStyles(
                {
                    // Blue arrow outline
                    "::before": {
                        content: "''",
                        display: "block",
                        position: "absolute",
                        borderWidth: arrowSize,
                        borderStyle: "solid",
                        borderColor: "transparent",
                        [`border${firstUpper(dir.opposite)}Color`]: theme.color[
                            arrowColor
                        ],
                        zIndex: 1,
                        opacity: backgroundOpacity,
                        [dir.opposite]: "100%",
                        [dir.offset]: `calc(${offsetPer}% + ${borderRadiusSize}px - ${Math.floor(
                            2 * slidePadding * pointerOffsetFrac
                        )}px)`,
                    },
                    // White inner arrow
                    "::after": {
                        content: "''",
                        display: "block",
                        position: "absolute",
                        borderWidth: arrowSize - arrowBorderWidth,
                        borderStyle: "solid",
                        borderColor: "transparent",
                        [`border${firstUpper(dir.opposite)}Color`]: theme.color[
                            background
                        ],
                        zIndex: 1,
                        opacity: backgroundOpacity,
                        [dir.opposite]: "100%",
                        [dir.offset]: `calc(${offsetPer}% + ${
                            borderRadiusSize + arrowBorderWidth
                        }px - ${Math.floor(2 * slidePadding * pointerOffsetFrac)}px)`,
                    },
                    // Correct container's position to make arrow have the right position
                    left:
                        x +
                        (dir.offset == "left"
                            ? -(slidePadding + slideWidth * pointerOffsetFrac)
                            : arrowSize -
                              (dir.opposite == "left" && width
                                  ? width + arrowSize * 2
                                  : 0)),
                    top:
                        y +
                        (dir.offset == "top"
                            ? -(slidePadding + slideHeight * pointerOffsetFrac)
                            : arrowSize -
                              (dir.opposite == "top" && height
                                  ? height + arrowSize * 2
                                  : 0)),
                },
                css
            )}>
            {children}
        </Overlay>
    );
};

const directionalProps = {
    left: {opposite: "right", offset: "top"},
    right: {opposite: "left", offset: "top"},
    up: {opposite: "bottom", offset: "left"},
    down: {opposite: "top", offset: "left"},
};
const firstUpper = (text: string) => text[0].toUpperCase() + text.substring(1);
