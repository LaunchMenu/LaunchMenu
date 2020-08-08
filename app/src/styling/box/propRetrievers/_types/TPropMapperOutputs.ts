import {IPropMapper} from "./IPropMapper";
import {TFlatten} from "../../../../_types/TFlatten";

/**
 * Extracts the output types from a set of property mappers
 */
export type TPropMapperOutputs<
    T extends IPropMapper<any>,
    M extends keyof T = keyof T
> = TFlatten<
    {
        [P in keyof T & M]: T[P] extends (...args: any[]) => infer V ? V : never;
    }
>;
