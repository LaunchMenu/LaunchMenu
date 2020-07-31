import {TokenType} from "chevrotain";

export type IHighlightTokenType = {
    /** The tags to be used for highlighting */
    tags: string[];
} & TokenType;
