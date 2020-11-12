import type {Ace} from "ace-builds";
import {ITextSelection} from "../../../textFields/_types/ITextSelection";
import {useRef, useCallback, useEffect, MutableRefObject} from "react";
import {get1dSelectionRange} from "../../../textFields/utils/rangeConversion";

/**
 * A hook for the selection listener of the ace editor
 * @param editor The editor to listen to
 * @param onSelectionChange The callback
 * @param lastSelectionProp The selection that was last set
 * @param readonly Whether the editor is readonly
 * @returns A mouse up listener to add to the container element
 */
export function useAceSelectionListener(
    editor: null | Ace.Editor,
    onSelectionChange:
        | undefined
        | ((selection: ITextSelection, range: Ace.Selection) => void),
    lastSelectionProp: MutableRefObject<Ace.Range | null>,
    unfocusable: boolean = false
): () => void {
    // Hacky mouse selection listener, since listening on the selection itself caused a bad feedback loop
    const lastSelectionCallback = useRef<Ace.Range | null>(null);

    const onMouseUp = useCallback(() => {
        if (!onSelectionChange) return;
        const selection = editor?.selection;
        const range = selection?.getRange();
        if (editor && selection && range) {
            // Test whether the selection is new
            if (lastSelectionProp.current) {
                if (lastSelectionProp.current.isEqual(range)) return;
            } else if (lastSelectionCallback.current) {
                if (lastSelectionCallback.current.isEqual(range)) return;
            }

            // If it is new, send a callback
            onSelectionChange(
                get1dSelectionRange(editor.getValue(), range, selection.isBackwards()),
                selection
            );
            lastSelectionCallback.current = range;
        }
    }, [editor]);

    // If not in readonly mode, we must also actively listen for non mouse changes (which may bug)
    useEffect(() => {
        if (editor && onSelectionChange) {
            const selection = editor.selection;
            const onChange = () => {
                if (unfocusable) return;
                const range = selection.getRange();
                onSelectionChange(
                    get1dSelectionRange(
                        editor.getValue(),
                        range,
                        selection.isBackwards()
                    ),
                    selection
                );
            };
            selection.on("changeSelection", onChange);
            return () => selection.off("changeSelection", onChange);
        }
    }, [editor, unfocusable]);

    return unfocusable ? onMouseUp : () => {};
}
