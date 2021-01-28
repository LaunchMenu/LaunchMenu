import {IAction} from "../../_types/IAction";

/** Obtains a union of all ancestors for a given action (which includes the action itself) */
export type TGetActionAncestors<T extends IAction> = T extends IAction<any, any, infer A>
    ? A extends IAction
        ? T | TGetActionAncestors<A>
        : T
    : never;
