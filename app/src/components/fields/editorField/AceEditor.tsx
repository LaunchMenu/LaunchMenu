import React, {FC, useRef, useEffect, useState, useCallback} from "react";
import {edit, Ace, Range} from "ace-builds";
import {IAceEditorProps} from "./_types/IAceEditorProps";
import {get2dSelectionRange, get1dSelectionRange} from "./rangeConversion";
import {Box} from "../../../styling/box/Box";
import {useAceSelectionListener} from "./useAceSelectionListener";

// Make sure all of ace is easily accessible
export * from "ace-builds";

/**
 * A react component for the ace text editor
 */
export const AceEditor: FC<IAceEditorProps> = ({
    options,
    ref,
    value,
    onChange,
    selection,
    selectionRange,
    onSelectionChange,
    ...rest
}) => {
    // Create the editor
    let divRef = useRef<HTMLDivElement>(null);
    let [editor, setEditor] = useState(null as Ace.Editor | null);
    useEffect(() => {
        if (divRef.current && !editor) {
            // Create the editor
            let editor = edit(divRef.current);
            if (options) editor.setOptions(options);
            setEditor(editor);

            // Create the ref
            if (ref instanceof Function) ref(editor);
            else if (ref) ref.current = editor;

            // Manage disposal
            return () => editor.destroy();
        }
    }, []);

    // Handle focus
    useEffect(() => {
        const div = divRef.current;
        if (div && options?.unfocusable) {
            // A function that automatically returns focus to the previously focused element
            const focusListener = (e: FocusEvent) => {
                if (e.relatedTarget && "focus" in e.relatedTarget)
                    (e.relatedTarget as HTMLElement).focus();
                else if (e.target && "blur" in e.target) (e.target as HTMLElement).blur();
            };

            // Register and remove the listeners
            div.addEventListener("focusin", focusListener);
            return () => div.removeEventListener("focusin", focusListener);
        }
    }, []);

    // Listen for data changes
    useEffect(() => {
        editor?.on("change", delta => {
            onChange?.(editor?.getValue() || "", delta);
        });
    }, [editor]);
    const mouseMove = useAceSelectionListener(
        editor,
        onSelectionChange,
        options?.readOnly
    );

    // Update data on changes
    useEffect(() => {
        if (editor && value !== undefined) {
            editor.getSession().setValue(value);
            if (selection)
                editor.selection.setRange(
                    get2dSelectionRange(editor.getValue(), selection)
                );
        }
    }, [value, editor]);

    useEffect(() => {
        if (editor) {
            if (selection)
                editor.selection.setRange(
                    get2dSelectionRange(editor.getValue(), selection)
                );
            else if (selectionRange) editor.selection.setRange(selectionRange);
        }
    }, [selection?.start, selection?.end, selectionRange, editor]);

    // Return the div
    return <Box elRef={divRef} {...rest} onMouseMove={mouseMove} />;
};
