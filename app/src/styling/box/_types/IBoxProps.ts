import {CSSProperties} from "react";
import {SpacingAttributes} from "../attributeRetrievers/getSpacingAttributes";
import {ColorAttributes} from "../attributeRetrievers/getColorAttributes";
import {MappedAttributes} from "../attributeRetrievers/getMappedAttributes";
import {DomAttributes} from "../attributeRetrievers/getDomAttributes";
import {ElevationAttributes} from "../attributeRetrievers/getElevation";
import {ICssProp} from "./ICssProp";

/**
 * The properties that can be applied to style a box
 */
export type IBoxProps = {
    children?: any;
    as?: React.ComponentClass | React.FunctionComponent | string;
    css?: ICssProp;
} & SpacingAttributes &
    ColorAttributes &
    MappedAttributes &
    DomAttributes &
    ElevationAttributes;
