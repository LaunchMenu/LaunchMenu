import {IUUID} from "../../../_types/IUUID";
import {IPatternMatch} from "./IPatternMatch";

/** The node dat for the search pattern filter */
export type ISearchPatternFilterNode<I> = {
    /** The ID of the node */
    ID: IUUID;
    /** The item that was last found for the node */
    item?: I;
    /** The pattern that was last found for the node */
    pattern?: IPatternMatch;
};
