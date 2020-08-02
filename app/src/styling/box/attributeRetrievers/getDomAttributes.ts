import {IAnyProps} from "./_types/IAnyProps";
import {getAttributes} from "./getAttributes";
import {ReactNode, CSSProperties, DOMAttributes, Ref} from "react";

/**
 * All the acceptable dom attributes, mapped to either true if the DOM camelcase attribute name is the same,
 * or a string if it's different
 */
export const domAttributes = {
    children: true,
    className: (out: IAnyProps, value: string) => {
        if (out["className"]) out["className"] += " " + value;
        else out["className"] = value;
    },
    class: (out: IAnyProps, value: string) => {
        if (out["className"]) out["className"] += " " + value;
        else out["className"] = value;
    },
    elRef: (out: IAnyProps, value: Ref<any> | Ref<any>[]) => {
        // If the ref is an array, combine them into 1 setter function
        if (value instanceof Array) {
            const values = value;
            value = (ref: any) =>
                values.forEach(value => {
                    if (value instanceof Function) value(ref);
                    else (value as any).current = ref;
                });
        }

        out["ref"] = value;
    },
    style: true,
    draggable: true,
    title: true,
};

/**
 * The attributes that can be assigned
 */
export type DomAttributes = {
    children?: ReactNode;
    className?: string;
    class?: string;
    style?: CSSProperties;
    draggable?: boolean;
    title?: string;
    elRef?: Ref<any> | Ref<any>[];
} & DOMAttributes<Element>; // Standard event listeners

/**
 * Retrieves all applicable attributes
 * @param props The props to retrieve the data from
 * @returns The css props
 */
export function getDomAttributes(props: IAnyProps): IAnyProps {
    return getAttributes(
        props,
        key => {
            if (domAttributes[key]) return domAttributes[key];
            else if (key.match(/^on/)) return true;
        },
        (value: any) => value
    );
}
