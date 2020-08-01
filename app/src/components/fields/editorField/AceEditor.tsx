import React, {FC, useRef, useEffect, useState, useCallback} from "react";
import {edit, Ace, config} from "ace-builds";
import {IAceEditorProps} from "./_types/IAceEditorProps";
import {get2dSelectionRange} from "../../../textFields/utils/rangeConversion";
import {Box} from "../../../styling/box/Box";
import {useAceSelectionListener} from "./useAceSelectionListener";

// Make sure all of ace is easily accessible
export * from "ace-builds";

// https://github.com/ajaxorg/ace/issues/1518#issuecomment-324130995
config.set("basePath", "/ace-builds/src-noconflict");
config.set("modePath", "/ace-builds/src-noconflict");
config.set("themePath", "/ace-builds/src-noconflict");

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

    const lastSelectionProp = useRef<Ace.Range | null>(null);
    const onMouseUp = useAceSelectionListener(
        editor,
        onSelectionChange,
        lastSelectionProp,
        options?.unfocusable
    );

    // Update data on changes
    let setRange = useCallback(
        (selection, selectionRange) => {
            if (editor) {
                let s: Ace.Range | null = null;
                if (selection) s = get2dSelectionRange(editor.getValue(), selection);
                else if (selectionRange) s = selectionRange;

                if (s) {
                    lastSelectionProp.current = s;
                    editor.selection.setRange(s);
                    if (options?.followCursor)
                        editor.renderer.scrollCursorIntoView(s.end);
                }
            }
        },
        [editor]
    );
    useEffect(() => {
        setRange(selection, selectionRange);
    }, [selection?.start, selection?.end, selectionRange, editor]);

    useEffect(() => {
        if (editor && value !== undefined) {
            editor.getSession().setValue(value);
            if (selection || selectionRange) setRange(selection, selectionRange);
        }
    }, [value, editor]);

    // Return the div
    return <Box elRef={divRef} {...rest} onMouseUp={onMouseUp} />;
};
