import {ReactNode, Ref, CSSProperties} from "react";

/**
 * All the mapping functions to map properties to dom properties
 */
export const domLiteralMappers = {
    children: (p: ReactNode) => ({children: p}),
    className: (p: string) => p,
    elRef: (value: Ref<any> | Ref<any>[]) => {
        // If the ref is an array, combine them into 1 setter function
        if (value instanceof Array) {
            const values = value;
            value = (ref: any) =>
                values.forEach(value => {
                    if (value instanceof Function) value(ref);
                    else (value as any).current = ref;
                });
        }

        return {ref: value};
    },
    style: (p: CSSProperties) => ({style: p}),
    draggable: (p: boolean) => p,
    title: (p: string) => p,
};
