import React, {FC, isValidElement} from "react";
import {Box} from "../../styling/box/Box";
import {ITextFieldViewProps} from "./_types/ITextFieldViewProps";
import {Icon} from "@fluentui/react";
import {mergeStyles} from "../../utils/mergeStyles";
import {useTheme} from "../../styling/theming/ThemeContext";
import {EditorField} from "./editorField/EditorField";

const iconSize = 60;

/**
 * A standard customizable view for text fields
 */
export const TextFieldView: FC<ITextFieldViewProps> = ({icon, textField, ...rest}) => {
    const theme = useTheme();

    return (
        <Box display="flex" alignItems="stretch" backgroundColor="bgPrimary" {...rest}>
            {icon && (
                <Box
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    width={iconSize}
                    height={iconSize}
                    zIndex={1}>
                    {isValidElement(icon) ? (
                        icon
                    ) : (
                        <Icon
                            {...icon}
                            styles={mergeStyles(
                                {
                                    root: {
                                        fontSize: 23,
                                        padding: theme.spacing(1),
                                        color: "#424242",
                                    },
                                },
                                icon.styles
                            )}
                        />
                    )}
                </Box>
            )}
            <Box
                display="flex"
                alignItems="center"
                flexGrow={1}
                height={iconSize}
                paddingRight={1}>
                <EditorField field={textField} flexGrow={1} />
            </Box>
        </Box>
    );
};
