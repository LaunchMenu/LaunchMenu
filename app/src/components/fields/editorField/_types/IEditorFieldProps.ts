import {TextField} from "../../../../textFields/TextField";
import {IAceEditorOptions} from "./IAceEditorOptions";
import {Ace} from "ace-builds";
import {MutableRefObject} from "react";
import {IBoxProps} from "../../../../styling/box/_types/IBoxProps";

export type IEditorFieldProps = {
    field: TextField;
    ref?: ((editor: Ace.Editor) => void) | MutableRefObject<Ace.Editor>;
    options?: IAceEditorOptions;
} & IBoxProps;
