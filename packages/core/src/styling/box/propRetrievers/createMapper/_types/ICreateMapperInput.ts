export type ICreateMapperInput<C, I> = {
    [name: string]: ((prop: I, context: C) => any | {[key: string]: any}) | true | string;
};
