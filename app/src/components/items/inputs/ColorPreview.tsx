import React from "react";
import {Box} from "../../../styling/box/Box";
import {IBoxProps} from "../../../styling/box/_types/IBoxProps";
import {LFC} from "../../../_types/LFC";

/** A component to show the preview of a color */
export const ColorPreview: LFC<
    {color: string; size: number} & Omit<IBoxProps, "color">
> = ({color, size, ...rest}) => (
    <Box
        display="inline-block"
        verticalAlign="middle"
        css={{backgroundColor: color}}
        width={size}
        height={size}
        {...rest}
    />
);
