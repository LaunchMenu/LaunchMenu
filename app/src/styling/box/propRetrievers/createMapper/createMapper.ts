import {ICreateMapperInput} from "./_types/ICreateMapperInput";
import {TCreateMapperOutput} from "./_types/TCreateMapperOutput";
import {ExtendedObject} from "../../../../utils/ExtendedObject";

/**
 * Creates a mapper using a default map function
 * @param map The standard function that maps an input to an output
 * @param mapperInput The data to be mapped, functions will remain functions, true will be replaced by the default mapping, strings wil use the default map function but get aliased
 * @returns A valid mapper definition
 */
export function createMapper<C, I, O, M extends ICreateMapperInput<C, I, O>>(
    map: (value: I, context: C) => O,
    mapperInput: M
): TCreateMapperOutput<M, C, I, O> {
    return ExtendedObject.map(mapperInput, value => {
        if (typeof value == "string")
            return (value, context) => ({[value]: map(value, context)});
        if (value == true) return map;
        return value;
    }) as any;
}
