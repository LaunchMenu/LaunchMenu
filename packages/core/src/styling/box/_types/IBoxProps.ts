import {ICssProps} from "../propRetrievers/mapCssProps";
import {IDomProps} from "../propRetrievers/mapDomProps";

/**
 * The properties that can be applied to style a box
 */
export type IBoxProps = {
    as?: React.ComponentClass | React.FunctionComponent | string;
} & Partial<ICssProps> &
    Partial<IDomProps>;
