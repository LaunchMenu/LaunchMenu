import {IStyleFunction, ITextFieldStyleProps, ITextFieldStyles} from "@fluentui/react";
import {TDeepPartial} from "../_types/TDeepPartial";
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
): ICssProp | undefined;

/**
 * Merges the styles for a fluent-ui element
 * @param stylesA Style set A
 * @param stylesB Style set B (which takes precedence)
 * @returns The combined styles
 */
export function mergeStyles<GProps, GStyles>(
    stylesA: IStyleFunction<GProps, GStyles> | TDeepPartial<GStyles> | undefined,
    stylesB: IStyleFunction<GProps, GStyles> | TDeepPartial<GStyles> | undefined
): IStyleFunction<GProps, GStyles> | TDeepPartial<GStyles> | undefined;

export function mergeStyles<GProps, GStyles>(
    stylesA:
        | IStyleFunction<GProps, GStyles>
        | TDeepPartial<GStyles>
        | ICssProp
        | undefined,
    stylesB:
        | IStyleFunction<GProps, GStyles>
        | TDeepPartial<GStyles>
        | ICssProp
        | undefined
): IStyleFunction<GProps, GStyles> | TDeepPartial<GStyles> | ICssProp | undefined {
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
    return merger as IStyleFunction<GProps, GStyles>;
}
