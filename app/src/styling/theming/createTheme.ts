import {IThemeInput} from "./_types/IThemeInput";
import {ITheme} from "./_types/ITheme";
import Color from "color";

/**
 * Creates a new theme from the given input
 * @param themeInput The theme input data
 * @returns The theme
 */
export function createTheme(themeInput: IThemeInput): ITheme {
    const neutralStart = Color(themeInput.colors.neutral.start);
    const neutralEnd = Color(themeInput.colors.neutral.end);
    return {
        ...themeInput,
        colors: {
            primary: themeInput.colors.primary.default,
            primaryLight: themeInput.colors.primary.light,
            primaryDark: themeInput.colors.primary.dark,
            secondary: themeInput.colors.secondary.default,
            secondaryLight: themeInput.colors.secondary.light,
            secondaryDark: themeInput.colors.secondary.dark,
            neutral0: neutralStart.mix(neutralEnd, 0).string(),
            neutral1: neutralStart.mix(neutralEnd, 0.1).string(),
            neutral2: neutralStart.mix(neutralEnd, 0.2).string(),
            neutral3: neutralStart.mix(neutralEnd, 0.3).string(),
            neutral4: neutralStart.mix(neutralEnd, 0.4).string(),
            neutral5: neutralStart.mix(neutralEnd, 0.5).string(),
            neutral6: neutralStart.mix(neutralEnd, 0.6).string(),
            neutral7: neutralStart.mix(neutralEnd, 0.7).string(),
            neutral8: neutralStart.mix(neutralEnd, 0.8).string(),
            neutral9: neutralStart.mix(neutralEnd, 0.9).string(),
            white: themeInput.colors.white,
            black: themeInput.colors.black,
        },
        spacing: multiple => themeInput.spacingMultiple * multiple,
    };
}
