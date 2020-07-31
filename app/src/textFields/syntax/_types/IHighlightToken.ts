import {IToken} from "chevrotain";

/**
 * A token obtained from lexical analysis on input syntax using a highlight lexer
 */
export type IHighlightToken = {
    /** The tags to be used for highlighting */
    tags: string[];
} & IToken;
