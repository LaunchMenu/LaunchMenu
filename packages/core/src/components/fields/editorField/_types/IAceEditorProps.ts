import {IAceEditorOptions} from "./IAceEditorOptions";
import type {Ace} from "ace-builds";
import {MutableRefObject} from "react";
import {IBoxProps} from "../../../../styling/box/_types/IBoxProps";
import {ITextSelection} from "../../../../textFields/_types/ITextSelection";

export type IAceEditorProps = {
    options?: IAceEditorOptions;

    aceRef?: ((editor: Ace.Editor) => void) | MutableRefObject<Ace.Editor>;

    value?: string;
    onChange?: (value: string, delta: Ace.Delta) => void;
    selection?: ITextSelection;
    selectionRange?: Ace.Range;
    onSelectionChange?: (selection: ITextSelection, range: Ace.Selection) => void;
} & IBoxProps;
