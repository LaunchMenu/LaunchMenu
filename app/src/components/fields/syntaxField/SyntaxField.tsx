import React, {FC, useCallback, useState, useEffect} from "react";
import {ISyntaxFieldProps} from "./_types/ISyntaxFieldProps";
import {SyntaxHighlighter} from "./SyntaxHighlighter";
import {useTheme} from "../../../styling/theming/ThemeContext";
import {useDataHook} from "../../../utils/modelReact/useDataHook";
import {ITextSelection} from "../../../textFields/_types/ITextSelection";
import {useUpdateEffect} from "../../../utils/hooks/useUpdateEffect";
import {Box} from "../../../styling/box/Box";
import {mergeStyles} from "../../../utils/mergeStyles";
import {useHorizontalScroll} from "../../../utils/hooks/useHorizontalScroll";

export const SyntaxField: FC<ISyntaxFieldProps> = ({
    field,
    highlighter,
    setErrors,
    highlightErrors = 1000,
    ...rest
}) => {
    const {highlighting} = useTheme();

    // Interact with the field
    const [h] = useDataHook();
    const value = field.get(h);
    const selection = field.getSelection(h);
    const setSelection = useCallback(
        (selection: ITextSelection) => field.setSelection(selection),
        [field]
    );

    // Hide errors while typing
    const [errorsVisible, setErrorsVisible] = useState(
        typeof highlightErrors == "boolean" ? !highlightErrors : true
    );
    useUpdateEffect(() => {
        if (typeof highlightErrors != "number") return;
        setErrorsVisible(false);
        const timeout = setTimeout(() => setErrorsVisible(true), highlightErrors);
        return () => clearTimeout(timeout);
    }, [value]);

    return (
        <SyntaxHighlighter
            theme={highlighting}
            highlighter={highlighter}
            setErrors={setErrors}
            highlightErrors={errorsVisible}
            value={value}
            selection={selection}
            onSelectionChange={setSelection}
            {...rest}
            css={mergeStyles({"::-webkit-scrollbar": {display: "none"}}, rest.css)}
        />
    );
};
