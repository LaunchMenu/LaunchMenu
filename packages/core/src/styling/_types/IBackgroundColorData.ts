/**
 * Background color data of the UI
 */
export type IBackgroundColorData = {
    /** Whether the color isn't the standard background color */
    isHighlight: boolean;
    /** Whether the background color is dar */
    isDark?: boolean;
    /** The exact background color */
    color?: string | number;
    /** THe name of the color in the theme */
    themeColorName?: string;
};
