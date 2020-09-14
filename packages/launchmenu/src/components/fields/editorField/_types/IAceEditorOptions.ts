import {Ace} from "ace-builds";

export type IAceEditorOptions = {
    // Editor options
    selectionStyle?: "line" | "text";
    highlightActiveLine?: boolean;
    highlightSelectedWord?: boolean;
    readOnly?: boolean;
    cursorStyle?: "ace" | "slim" | "smooth" | "wide";
    mergeUndoDeltas?: true | false | "always";
    behavioursEnabled?: boolean;
    wrapBehavioursEnabled?: boolean;
    autoScrollEditorIntoView?: boolean;
    keyboardHandler?: (
        editor: Ace.Editor,
        noClue: number,
        key: string,
        keyCode: number,
        event: KeyboardEvent
    ) => void;

    // Renderer options
    animatedScroll?: boolean;
    displayIndentGuides?: boolean;
    showInvisibles?: boolean;
    showPrintMargin?: boolean;
    printMarginColumn?: number;
    printMargin?: boolean | number;
    showGutter?: boolean;
    fadeFoldWidgets?: boolean;
    showFoldWidgets?: boolean;
    showLineNumbers?: boolean;
    highlightGutterLine?: boolean;
    hScrollBarAlwaysVisible?: boolean;
    vScrollBarAlwaysVisible?: boolean;
    fontSize?: number | string;
    fontFamily?: string;
    maxLines?: number;
    minLines?: number;
    maxPixelHeight?: number;
    scrollPastEnd?: number;
    fixedWidthGutter?: boolean;
    theme?: string;

    // Mouse handler options
    scrollSpeed?: number;
    dragDelay?: number;
    dragEnabled?: boolean;
    focusTimout?: number;
    tooltipFollowsMouse?: boolean;

    // Session options
    firstLineNumber?: number;
    overwrite?: boolean;
    newLineMode?: "auto" | "unix" | "windows";
    useWorker?: boolean;
    useSoftTabs?: boolean;
    tabSize?: number;
    wrap?: boolean | "free" | "off" | number;
    indentedSoftWrap?: boolean;
    foldStyle?: "manual" | "markbegin" | "markbeginend";
    mode?: string;
} & { // Custom options
    unfocusable?: boolean;
    followCursor?: boolean;
};
