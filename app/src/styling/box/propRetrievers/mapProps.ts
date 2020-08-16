import {IPropMapper} from "./_types/IPropMapper";
import {TPropMapperOutputs} from "./_types/TPropMapperOutputs";
import {TPropMapperInputs} from "./_types/TPropMapperInputs";

/**
 * Maps the given props to other props
 * @param props The props to map
 * @param mapper The mapper definitions for each of the properties
 * @param context The context to pass to the mapper definitions
 * @param output An optional output object to add the properties to
 * @returns The resulting object after mapping
 */
export function mapProps<
    M extends IPropMapper<T>,
    T,
    I extends Partial<TPropMapperInputs<M>>
>(
    props: I,
    mapper: M,
    context: T,
    output: Object = {}
): TPropMapperOutputs<M, keyof I & keyof M> {
    Object.keys(props).forEach(propName => {
        // Ignore any props that aren't specified in the mapper
        if (mapper[propName]) {
            const value = mapper[propName](props[propName], context);

            // IF the value is an object 'expand' it into the result
            if (value instanceof Object && !(value instanceof Function)) {
                Object.keys(value).forEach(resPropName => {
                    output[resPropName] = value[resPropName];
                });
            }
            // Otherwise just assign it directly
            else {
                output[propName] = value;
            }
        }
    });

    return output as any;
}
