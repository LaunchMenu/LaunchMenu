import React, {FC, useCallback} from "react";
import {AceEditor} from "./AceEditor";
import {useDataHook} from "model-react";
import {IEditorFieldProps} from "./_types/IEditorFieldProps";
import {mergeStyles} from "../../../utils/mergeStyles";

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
    return (
        <AceEditor
            options={{
                readOnly: true,
                unfocusable: true,
                ...options,
            }}
            value={value}
            css={mergeStyles({".ace_hidden-cursors .ace_cursor": {opacity: 1}}, css)}
            ref={ref}
            onSelectionChange={useCallback(selection => field.setSelection(selection), [
                field,
            ])}
            selection={selection}
            {...rest}
        />
    );
};
