import {IPropMapper} from "./IPropMapper";

/**
 * Extracts the input types from a set of property mappers
 */
export type TPropMapperInputs<T extends IPropMapper<any>> = {
    [P in keyof T]: T[P] extends (value: infer V, ...rest: any[]) => any ? V : never;
};
