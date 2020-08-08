import {IActionCore} from "../../_types/IActionCore";

/**
 * The core transformer of a menu action
 */
export type IContextActionCoreInput<I, O extends {execute: () => any}> = IActionCore<
    I,
    O
>;
