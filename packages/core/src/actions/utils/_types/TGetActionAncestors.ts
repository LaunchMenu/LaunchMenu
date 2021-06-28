import {IAction} from "../../_types/IAction";

/** Obtains a union of all ancestors for a given action (which includes the action itself) */
export type TGetActionAncestors<T extends any> = T extends IAction<any, any, infer A>
    ? any extends A
        ? never
        : T | TGetActionAncestors<A>
    : never;
