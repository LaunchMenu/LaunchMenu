import React, {useRef, useEffect, useState, useCallback, useLayoutEffect} from "react";
import type {Ace} from "ace-builds";
import {IAceEditorProps} from "./_types/IAceEditorProps";
import {get2dSelectionRange} from "../../../textFields/utils/rangeConversion";
import {Box} from "../../../styling/box/Box";
import {useAceSelectionListener} from "./useAceSelectionListener";
import {LFC} from "../../../_types/LFC";
import {getAce} from "./getAce";
import {useResizeDetector} from "react-resize-detector";
import {useDeepUpdateEffect} from "../../../utils/hooks/useDeepUpdateEffect";
/**
 * A react component for the ace text editor
 */
export const AceEditor: LFC<IAceEditorProps> = ({
    options,
    aceRef,
    value,
    onChange,
    selection,
    selectionRange,
    onSelectionChange,
    ...rest
}) => {
    // Create the editor
    let divRef = useRef<HTMLDivElement | null>(null);
    let [editor, setEditor] = useState(null as Ace.Editor | null);
    useLayoutEffect(() => {
        if (divRef.current) {
            // Create the editor
            let editor = getAce().edit(divRef.current);
            if (!options?.theme) editor.setTheme("ace/theme/dreamweaver");
            if (options) editor.setOptions(options);
            setEditor(editor);

            // Create the ref
            if (aceRef instanceof Function) aceRef(editor);
            else if (aceRef) aceRef.current = editor;

            // Manage disposal
            return () => editor.destroy();
        }
    }, []);

    // Update the options on change
    useDeepUpdateEffect(() => {
        if (editor && options) editor.setOptions(options);
    }, [options]);

    // Resize management
    const resizeCallback = useCallback(() => {
        if (editor) {
            editor.resize();
            setRange(selection, selectionRange);
        }
    }, [editor, selection, selectionRange]);
    const {ref: resizeRef} = useResizeDetector({onResize: resizeCallback});
    const ref = useCallback((el: HTMLDivElement) => {
        resizeRef.current = el;
        divRef.current = el;
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
    return <Box elRef={ref} {...rest} onMouseUp={onMouseUp} />;
};
