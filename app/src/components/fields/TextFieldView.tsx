import React, {FC, isValidElement} from "react";
import {Box} from "../../styling/box/Box";
import {ITextFieldViewProps} from "./_types/ITextFieldViewProps";
import {useTheme} from "../../styling/theming/ThemeContext";
import {SyntaxField} from "./syntaxField/SyntaxField";
import {textLexer} from "../../textFields/syntax/TextLexer";
import {ThemeIcon} from "../ThemeIcon";

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
                    height={iconSize}>
                    {isValidElement(icon) ? (
                        icon
                    ) : (
                        <Box padding="medium" font="textField">
                            <ThemeIcon icon={icon} />
                        </Box>
                    )}
                </Box>
            )}
            <Box
                display="flex"
                alignItems="center"
                flexGrow={1}
                overflow="auto"
                css={{
                    fontSize: 25,
                }}
                height={iconSize}>
                <SyntaxField
                    width="100%"
                    field={field}
                    highlighter={highlighter}
                    setErrors={setErrors}
                    highlightErrors={highlightErrors}
                    paddingRight="medium"
                />
            </Box>
        </Box>
    );
};
