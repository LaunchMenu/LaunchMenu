/**
 * A set of property mappers
 */
export type IPropMapper<T> = {
    [name: string]: (value: any, context: T) => any;
};
