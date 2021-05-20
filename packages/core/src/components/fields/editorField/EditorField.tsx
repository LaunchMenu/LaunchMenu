import React, {useCallback} from "react";
import {AceEditor} from "./AceEditor";
import {IEditorFieldProps} from "./_types/IEditorFieldProps";
import {mergeStyles} from "../../../utils/mergeStyles";
import {LFC} from "../../../_types/LFC";
import {useDataHook} from "model-react";
import {useIOContext} from "../../../context/react/useIOContext";
import {baseSettings} from "../../../application/settings/baseSettings/baseSettings";

/**
 * An editor field that uses ace to highlight text
 */
export const EditorField: LFC<IEditorFieldProps> = ({
    field,
    ref,
    options,
    onChange,
    css,
    contentMode = true,
    ...rest
}) => {
    const ioContext = useIOContext();
    const [h] = useDataHook();
    const value = field.get(h);
    const selection = field.getSelection(h);
    const setSelection = useCallback(selection => field.setSelection(selection), [field]);
    return (
        <AceEditor
            options={{
                readOnly: true,
                unfocusable: true,
                wrap:
                    ioContext?.settings
                        .get(baseSettings)
                        .field.editor.lineWrapping.get(h) ?? false,
                maxLines: contentMode ? undefined : Infinity,
                fontSize: contentMode ? 14 : 24,
                followCursor: true,
                highlightActiveLine: false,
                showPrintMargin: false,
                highlightGutterLine: false,
                enableMultiselect: false,
                ...options,
            }}
            value={value}
            css={mergeStyles(
                theme => ({
                    ".ace_hidden-cursors .ace_cursor": {opacity: 1},
                    ...(contentMode && {
                        height: "100%",
                        color: theme.color.fontBgSecondary,
                        background: theme.color.bgSecondary,
                        "& .ace_gutter": {
                            color: theme.color.fontBgTertiary,
                            background: theme.color.bgTertiary,
                        },
                    }),
                }),
                css
            )}
            aceRef={ref}
            onSelectionChange={setSelection}
            selection={selection}
            {...rest}
        />
    );
};
