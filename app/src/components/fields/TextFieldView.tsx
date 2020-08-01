import React, {FC, isValidElement} from "react";
import {Box} from "../../styling/box/Box";
import {ITextFieldViewProps} from "./_types/ITextFieldViewProps";
import {Icon} from "@fluentui/react";
import {mergeStyles} from "../../utils/mergeStyles";
import {useTheme} from "../../styling/theming/ThemeContext";
import {SyntaxField} from "./syntaxField/SyntaxField";
import {textLexer} from "../../textFields/syntax/TextLexer";

const iconSize = 60;

/**
 * A standard customizable view for text fields
 */
export const TextFieldView: FC<ITextFieldViewProps> = ({
    icon,
    field,
    highlighter = textLexer,
    setErrors,
    highlightErrors,
    ...rest
}) => {
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
                css={{
                    fontSize: 25,
                }}
                height={iconSize}
                paddingRight={1}>
                <SyntaxField
                    field={field}
                    highlighter={highlighter}
                    setErrors={setErrors}
                    highlightErrors={highlightErrors}
                />
            </Box>
        </Box>
    );
};
