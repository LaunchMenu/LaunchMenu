import React, {FC, useMemo} from "react";
import {ISyntaxRendererProps} from "./_types/ISyntaxRendererProps";
import {Box} from "../../../styling/box/Box";
import {SyntaxHighlighter} from "./SyntaxHighlighter";
import {getHighlightThemeStyle} from "../../../styling/theming/highlighting/getHighlightThemeStyle";
import {mergeStyles} from "../../../utils/mergeStyles";

export const SyntaxRenderer: FC<ISyntaxRendererProps> = ({
    selection,
    onSelectionChange,
    theme,
    value,
    highlighter,
    setErrors,
    ...rest
}) => {
    const syntaxStyling = useMemo(() => theme && getHighlightThemeStyle(theme), [theme]);
    if (syntaxStyling) rest.css = mergeStyles(syntaxStyling, rest.css);

    return (
        <Box {...rest}>
            <SyntaxHighlighter
                value={value}
                highlighter={highlighter}
                setErrors={setErrors}
            />
            <SyntaxHighlighter
                display={"none"}
                value={value}
                highlighter={highlighter}
                setErrors={setErrors}
            />
        </Box>
    );
};
