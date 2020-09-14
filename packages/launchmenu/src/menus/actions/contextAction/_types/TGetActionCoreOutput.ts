import {IActionCore} from "../../_types/IActionCore";

/**
 * Extracts the output type of an action core
 */
export type TGetActionCoreOutput<A extends IActionCore<any, any>> = A extends (
    ...args: any[]
) => infer U
    ? U
    : never;
