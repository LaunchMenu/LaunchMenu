import {ExtendedObject} from "./ExtendedObject";
import {ICssProp} from "../styling/box/_types/ICssProp";

/**
 * Merges the css styles for a box element
 * @param stylesA Style set A
 * @param stylesB Style set B (which takes precedence)
 * @returns The combined styles
 */
export function mergeStyles(
    stylesA: ICssProp | undefined,
    stylesB: ICssProp | undefined
): ICssProp | undefined {
    if (!stylesA) return stylesB;
    if (!stylesB) return stylesA;
    const merger = styles => {
        let a = stylesA;
        let b = stylesB;
        if (a instanceof Function) a = a(styles);
        if (b instanceof Function) b = b(styles);

        const merged = ExtendedObject.deepMerge(a, b);
        return merged;
    };
    return merger as ICssProp;
}
