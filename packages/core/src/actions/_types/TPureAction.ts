import {IAction} from "./IAction";

/**
 * Extracts purely the action interface of some type that extends the action interface
 */
export type TPureAction<A extends IAction> = A extends IAction<infer I, infer O, infer P>
    ? IAction<I, O, P>
    : never;
