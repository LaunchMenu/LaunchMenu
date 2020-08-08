export type IPropMapper<T> = {
    [name: string]: (value: any, context: T) => any;
};
