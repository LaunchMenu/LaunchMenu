import {IPropMapper} from "./IPropMapper";

export type TPropMapperInputs<T extends IPropMapper<any>> = {
    [P in keyof T]: T[P] extends (value: infer V, ...rest: any[]) => any ? V : never;
};
