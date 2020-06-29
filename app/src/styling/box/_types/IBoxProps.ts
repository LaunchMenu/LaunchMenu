import {CSSProperties, DOMAttributes} from "react";
import {SpacingAttributes} from "../attributeRetrievers/getSpacingAttributes";
import {ColorAttributes} from "../attributeRetrievers/getColorAttributes";
import {MappedAttributes} from "../attributeRetrievers/getMappedAttributes";
import {DomAttributes} from "../attributeRetrievers/getDomAttributes";
import {Interpolation} from "@emotion/core";

/**
 * The properties that can be applied to style a box
 */
export type IBoxProps = {
    children?: any;
    as?: React.ComponentClass | React.FunctionComponent | string;
    className?: string;
    css?: Interpolation;
    style?: CSSProperties;
} & SpacingAttributes &
    ColorAttributes &
    MappedAttributes &
    DomAttributes;
