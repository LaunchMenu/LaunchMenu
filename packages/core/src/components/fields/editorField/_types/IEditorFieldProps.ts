import {IAceEditorOptions} from "./IAceEditorOptions";
import type {Ace} from "ace-builds";
import {MutableRefObject} from "react";
import {IBoxProps} from "../../../../styling/box/_types/IBoxProps";
import {ITextField} from "../../../../textFields/_types/ITextField";

export type IEditorFieldProps = {
    field: ITextField;
    ref?: ((editor: Ace.Editor) => void) | MutableRefObject<Ace.Editor>;
    options?: IAceEditorOptions;
    /** Whether this editor is supposed to be shown in the content area (defaults to true) */
    contentMode?: boolean;
} & IBoxProps;
