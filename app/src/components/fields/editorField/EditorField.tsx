import React, {FC, useCallback} from "react";
import {AceEditor} from "./AceEditor";
import {IEditorFieldProps} from "./_types/IEditorFieldProps";
import {mergeStyles} from "../../../utils/mergeStyles";
import {useDataHook} from "../../../utils/modelReact/useDataHook";

/**
 * An editor field that uses ace to highlight text
 */
export const EditorField: FC<IEditorFieldProps> = ({
    field,
    ref,
    options,
    onChange,
    css,
    ...rest
}) => {
    const [h] = useDataHook();
    const value = field.get(h);
    const selection = field.getSelection(h);
    const setSelection = useCallback(selection => field.setSelection(selection), [field]);
    return (
        <AceEditor
            options={{
                readOnly: true,
                unfocusable: true,
                maxLines: Infinity,
                fontSize: 24,
                fontFamily: "Inconsolata",
                followCursor: true,
                showGutter: false,
                highlightActiveLine: false,
                showPrintMargin: false,
                ...options,
            }}
            value={value}
            css={mergeStyles({".ace_hidden-cursors .ace_cursor": {opacity: 1}}, css)}
            ref={ref}
            onSelectionChange={setSelection}
            selection={selection}
            {...rest}
        />
    );
};
