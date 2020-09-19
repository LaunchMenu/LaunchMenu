import {IUUID} from "../../../_types/IUUID";
import {IPatternMatch} from "./IPatternMatch";
import {ISearchable} from "./ISearchable";

/** The search tree obtained by a search */
export type ISearchNode<Q, I> = {
    /** The searchable data to identify and update this node */
    searchable: ISearchable<Q, I>;
    /** The parent node */
    parent?: IUUID;
    /** The last obtained resulting item */
    item?: I;
    /** The last obtained children for this tree */
    children: IUUID[];
    /** The last obtained pattern match */
    patternMatch?: IPatternMatch;
    /** A function to dispose of the previously registered hook */
    destroyHook?: () => void;
};
