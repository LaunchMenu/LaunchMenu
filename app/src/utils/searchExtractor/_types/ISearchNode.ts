import {IUUID} from "../../../_types/IUUID";
import {ISearchable} from "./ISearchable";

/** The search tree obtained by a search */
export type ISearchNode<Q, I> = {
    /** The searchable data to identify and update this node */
    searchable: ISearchable<Q, I>;
    /** The resulting item */
    item?: I;
    /** The previously obtained children for this tree */
    children: IUUID[];
};
