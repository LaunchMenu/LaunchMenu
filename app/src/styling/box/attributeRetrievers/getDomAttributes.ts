import {AnyProps} from "./_types/anyProps";
import {getAttributes} from "./getAttributes";
import {ReactNode, CSSProperties, DOMAttributes, Ref} from "react";

/**
 * All the acceptable dom attributes, mapped to either true if the DOM camelcase attribute name is the same,
 * or a string if it's different
 */
export const domAttributes = {
    children: true,
    className: (out: AnyProps, value: string) => {
        if (out["className"]) out["className"] += " " + value;
        else out["className"] = value;
    },
    class: (out: AnyProps, value: string) => {
        if (out["className"]) out["className"] += " " + value;
        else out["className"] = value;
    },
    elRef: "ref",
    style: true,
    draggable: true,
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
    elRef?: Ref<any>;
} & DOMAttributes<Element>; // Standard event listeners

/**
 * Retrieves all aplicable attributes
 * @param props The props to retrieve the data from
 * @returns The css props
 */
export function getDomAttributes(props: AnyProps): AnyProps {
    return getAttributes(
        props,
        key => {
            if (domAttributes[key]) return domAttributes[key];
            else if (key.match(/^on/)) return true;
        },
        (value: any) => value
    );
}
