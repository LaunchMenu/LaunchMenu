import React, {useCallback, useState} from "react";
import {ISyntaxFieldProps} from "./_types/ISyntaxFieldProps";
import {SyntaxHighlighter} from "./SyntaxHighlighter";
import {useTheme} from "../../../styling/theming/ThemeContext";
import {ITextSelection} from "../../../textFields/_types/ITextSelection";
import {useUpdateEffect} from "../../../utils/hooks/useUpdateEffect";
import {mergeStyles} from "../../../utils/mergeStyles";
import {LFC} from "../../../_types/LFC";
import {useDataHook} from "model-react";

export const SyntaxField: LFC<ISyntaxFieldProps> = ({
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
