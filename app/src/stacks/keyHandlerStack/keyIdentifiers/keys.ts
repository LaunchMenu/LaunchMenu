import {ids} from "./ids";
import {names} from "./names";

/** All valid key matchers */
export const keys = {...ids, ...names};

/** A valid key matcher */
export type IKeyMatcher = keyof typeof keys;
