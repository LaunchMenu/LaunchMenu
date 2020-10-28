import {IActionCore} from "../../_types/IActionCore";

/**
 * Extracts the input type of an action core
 */
export type TGetActionCoreInput<A extends IActionCore<any, any>> = A extends (
    data: Array<infer U>,
    ...args: any[]
) => any
    ? U
    : never;
