import React, {FC} from "react";
import {Box} from "../styling/box/Box";
import {IBoxProps} from "../styling/box/_types/IBoxProps";
import {useTheme} from "../styling/theming/ThemeContext";

/**
 * A standard button component
 */
export const Button: FC<{primary?: boolean; disabled?: boolean} & IBoxProps> = ({
    primary,
    disabled,
    ...props
}) => {
    const theme = useTheme();
    return (
        <Box
            as="button"
            background={primary ? "primary" : "bgPrimary"}
            padding="medium"
            cursor={disabled ? "not-allowed" : "pointer"}
            borderRadius="small"
            elevation="small"
            css={{
                border: "none",
                outline: "none",
                ":hover": {
                    boxShadow: theme.elevation.medium,
                },
                ":active": {
                    backgroundColor: theme.color[primary ? "secondary" : "bgSecondary"],
                    boxShadow: theme.elevation.small,
                },
                transition: "background-color 0.1s, box-shadow 0.1s",
            }}
            {...props}
        />
    );
};
