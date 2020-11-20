import {ICreateMapperInput} from "./ICreateMapperInput";

/**
 * Maps the mapper input to the output mapper
 */
export type TCreateMapperOutput<M extends ICreateMapperInput<C, I>, C, I, O> = {
    [P in keyof M]: M[P] extends string
        ? (input: I, context: C) => {[P2 in M[P]]: O}
        : M[P] extends true
        ? (input: I, context: C) => O
        : M[P];
};
