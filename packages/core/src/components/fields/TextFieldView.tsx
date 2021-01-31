import React, {isValidElement} from "react";
import {Box} from "../../styling/box/Box";
import {ITextFieldViewProps} from "./_types/ITextFieldViewProps";
import {SyntaxField} from "./syntaxField/SyntaxField";
import {plaintextLexer} from "../../textFields/syntax/plaintextLexer";
import {ThemeIcon} from "../ThemeIcon";
import {LFC} from "../../_types/LFC";

const iconSize = 60;

/**
 * A standard customizable view for text fields
 */
export const TextFieldView: LFC<ITextFieldViewProps> = ({
    icon,
    field,
    highlighter = plaintextLexer,
    setErrors,
    highlightErrors,
    ...rest
}) => {
    return (
        <Box
            display="flex"
            paddingLeft="small"
            alignItems="stretch"
            backgroundColor="bgPrimary"
            {...rest}>
            {icon && (
                <Box
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    style={{fontSize: 30}}
                    width={iconSize}
                    height={iconSize}>
                    {isValidElement(icon) ? icon : <ThemeIcon icon={icon} />}
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
