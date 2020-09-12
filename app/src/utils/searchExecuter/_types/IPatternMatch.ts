import {IHighlightNode} from "../../../textFields/syntax/_types/IHighlightNode";
import {ITextSelection} from "../../../textFields/_types/ITextSelection";
import {IUUID} from "../../../_types/IUUID";

/**
 * A type for a pattern match when searching
 */
export type IPatternMatch = {
    /** The name of the pattern type that was matched  */
    name: string;
    /** A unique identifier for pattern comparisons */
    id?: IUUID;
    /** Syntax highlighting information to show the pattern */
    highlight?: (IHighlightNode | ITextSelection)[];
};
