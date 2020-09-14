import {keyIds} from "./ids";
import {keyNames} from "./names";

/** All valid key matchers */
export const keys = {...keyIds, ...keyNames};

/** A valid key matcher */
export type IKeyMatcher = keyof typeof keys;
