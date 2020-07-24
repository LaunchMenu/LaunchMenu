import React, {FC, isValidElement} from "react";
import {IMainFieldProps} from "./_types/IMainFieldProps";
import {Box} from "../../styling/box/Box";
import {FocusedField} from "./FocusedField";
import {useTheme} from "../../styling/theming/ThemeContext";
import {Icon} from "@fluentui/react";
import {mergeStyles} from "../../utils/mergeStyles";

export const MainField: FC<IMainFieldProps> = ({icon, ...rest}) => {
    const theme = useTheme();
    return (
        <Box display="flex" alignItems="center">
            {isValidElement(icon) ? (
                icon
            ) : icon ? (
                <Icon
                    {...icon}
                    styles={mergeStyles(
                        {root: {fontSize: 20, padding: theme.spacing(1)}},
                        icon.styles
                    )}
                />
            ) : undefined}
            <FocusedField
                styles={{root: {flexGrow: 1}, field: icon ? {paddingLeft: 0} : undefined}}
                borderless
                {...rest}
            />
        </Box>
    );
};
