import {ExtendedObject} from "./ExtendedObject";
import {ICssProp} from "../styling/box/_types/ICssProp";
import {ITheme} from "../styling/theming/_types/ITheme";
import {IEmotionCss} from "../styling/theming/_types/IEmotionCss";

/**
 * Merges the css styles for a box element
 * @param stylesA Style set A
 * @param stylesB Style set B (which takes precedence)
 * @returns The combined styles
 */
export function mergeStyles(
    stylesA: IEmotionCss | undefined,
    stylesB: IEmotionCss | undefined
): IEmotionCss | undefined;

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

export function mergeStyles(
    stylesA: ICssProp | IEmotionCss | undefined,
    stylesB: ICssProp | IEmotionCss | undefined
): ICssProp | IEmotionCss | undefined {
    if (!stylesA) return stylesB;
    if (!stylesB) return stylesA;
    const merger = (theme: ITheme) => {
        let a = stylesA;
        let b = stylesB;
        if (a instanceof Function) a = a(theme);
        if (b instanceof Function) b = b(theme);

        const merged = ExtendedObject.deepMerge(a, b);
        return merged;
    };
    return merger as ICssProp;
}
