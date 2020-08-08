export type ICreateMapperInput<C, I, O> = {
    [name: string]: ((prop: I, context: C) => O | {[key: string]: O}) | true | string;
};
