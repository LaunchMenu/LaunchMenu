export type ITheme = {
    colors: {
        primaryLight: string;
        primary: string;
        primaryDark: string;
        secondaryLight: string;
        secondary: string;
        secondaryDark: string;
        neutral0: string;
        neutral1: string;
        neutral2: string;
        neutral3: string;
        neutral4: string;
        neutral5: string;
        neutral6: string;
        neutral7: string;
        neutral8: string;
        neutral9: string;
        black: string;
        white: string;
    };
    spacing: (multiple: number) => number;
};
