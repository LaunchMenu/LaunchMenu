import {IAction} from "../../_types/IAction";
import {IActionBinding} from "../../_types/IActionBinding";
import {TGetActionAncestors} from "./TGetActionAncestors";

/** Retrieves unknown if the given binding is a direct or indirect binding for the given action, or retrieves an error message otherwise */
export type TIsBindingForAction<
    B extends IActionBinding,
    T extends IAction
> = B extends IActionBinding<infer A>
    ? A extends IAction
        ? T extends TGetActionAncestors<A>
            ? unknown
            : TShouldBeBindingForMessage<A>
        : TInvalidBindingMessage
    : never;

export type TShouldBeBindingForMessage<
    T extends IAction
> = "Should be a direct or indirect binding for the specified action";
export type TInvalidBindingMessage = "The specified binding isn't for a valid action";
