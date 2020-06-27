import {IThemeInput} from "./_types/IThemeInput";
import {ITheme} from "./_types/ITheme";
import Color from "color";
import {ExtendedObject} from "../utils/ExtendedObject";

/**
 * Creates a new theme from the given input
 * @param themeInput The theme input data
 * @returns The theme
 */
export function createTheme(themeInput: IThemeInput): ITheme {
    const neutralStart = Color(themeInput.colors.neutral.start);
    const neutralEnd = Color(themeInput.colors.neutral.start);
    return {
        ...themeInput,
        colors: {
            ...themeInput.colors,
            neutral: per => neutralStart.mix(neutralEnd, per).string(),
        },
        spacing: multiple => themeInput.spacingMultiple * multiple,
        icons: ExtendedObject.map(themeInput.icons, value => {
            if (typeof value == "string") {
            } else {
            }
        }),
    };
}
