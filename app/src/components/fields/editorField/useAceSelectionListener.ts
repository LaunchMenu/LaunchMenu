import {Ace} from "ace-builds";
import {ITextSelection} from "../../../textFields/_types/ITextSelection";
import {useRef, useCallback, useEffect} from "react";
import {get1dSelectionRange} from "./rangeConversion";

/**
 * A hook for the selection listener of the ace editor
 * @param editor The editor to listen to
 * @param onSelectionChange The callback
 * @param readonly Whether the editor is readonly
 * @returns A mouse listener to add to the container element
 */
export function useAceSelectionListener(
    editor: null | Ace.Editor,
    onSelectionChange:
        | undefined
        | ((selection: ITextSelection, range: Ace.Selection) => void),
    readonly: boolean = false
): () => void {
    // Hacky mouse selection listener, since listening on the selection itself caused a bad feedback loop
    const lastSelectionProp = useRef<Ace.Range | null>(null);
    const lastSelectionCallback = useRef<Ace.Range | null>(null);
    const onMouseMove = useCallback(() => {
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
        if (!readonly && editor && onSelectionChange) {
            const selection = editor.getSelection();
            const onChange = () => {
                onSelectionChange(
                    get1dSelectionRange(
                        editor.getValue(),
                        selection.getRange(),
                        selection.isBackwards()
                    ),
                    selection
                );
            };
            selection.addEventListener("changeSelection", onChange);
            return selection.removeEventListener("changeSelection", onChange);
        }
    }, [editor, readonly]);

    return readonly ? onMouseMove : () => {};
}
