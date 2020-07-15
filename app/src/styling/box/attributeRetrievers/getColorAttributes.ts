import {IAnyProps} from "./_types/IAnyProps";
import {getAttributes} from "./getAttributes";
import {ITheme} from "../../theming/_types/ITheme";
import {IPropValueGetter} from "./_types/IPropValueGetter";

/**
 * All the color attributes that accept any color,
 * mapped to either true if the css camelcase name is the same,
 * or a string if it's different
 */
export const colorsAttributesCustom = {
    backgroundCustom: "background",
    borderColorCustom: "borderColor",
    borderTopColorCustom: "borderTopColor",
    borderRightColorCustom: "borderRightColor",
    borderBottomColorCustom: "borderBottomColor",
    borderLeftColorCustom: "borderLeftColor",
    caretColorCustom: "caretColor",
    colorCustom: "color",
    columnRuleColorCustom: "columnRuleColor",
    outlineColorCustom: "outlineColor",
    textDecorationColorCustom: "textDecorationColor",
};

/**
 * All the color attributes that accept only theme colors,
 * mapped to either true if the css camelcase name is the same,
 * or a string if it's different
 */
export const colorsAttributesTheme = {
    background: (
        out: IAnyProps,
        value: string,
        key: string,
        rawValue: string,
        getValue: IPropValueGetter
    ) => {
        out.background = value;
        // Pair the background color with a text color
        if (!("color" in out))
            out.color = getValue(
                "font" + rawValue.charAt(0).toUpperCase() + rawValue.slice(1),
                "color",
                out
            );
    },
    backgroundColor: true,
    borderColor: true,
    borderTopColor: true,
    borderRightColor: true,
    borderBottomColor: true,
    borderLeftColor: true,
    caretColor: true,
    color: true,
    columnRuleColor: true,
    outlineColor: true,
    textDecorationColor: true,
};

/**
 * All the color attributes,
 * mapped to either true if the css camelcase name is the same,
 * or a string if it's different
 */
export const colorsAttributes = {
    ...colorsAttributesCustom,
    ...colorsAttributesTheme,
};

/**
 * The color attributes that can be assigned
 */
export type ColorAttributes = {
    [P in keyof typeof colorsAttributesCustom]?: keyof ITheme["colors"] | string;
} &
    {
        [P in keyof typeof colorsAttributesTheme]?: keyof ITheme["colors"];
    } & {
        background?:
            | "primary"
            | "secondary"
            | "tertiary"
            | "bgPrimary"
            | "bgSecondary"
            | "bgTertiary";
    };

/**
 * Retrieves all color attributes their css equivalent, with the value obtained from the theme
 * @param props The props to retrieve the colors from
 * @param theme The theme to get the colors from
 * @returns The css props
 */
export function getColorAttributes(props: IAnyProps, theme: ITheme): IAnyProps {
    return getAttributes(
        props,
        colorsAttributes,
        (value: any) => theme.colors[value] || value
    );
}
