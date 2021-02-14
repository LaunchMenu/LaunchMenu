import {IHighlightLanguage} from "./IHighlightLanguage";

/** All the note specific user configuration */
export type INoteAppearanceMetadata<I = never> = {
    /** The color of this note */
    color: string | I;
    /** The syntax highlighting mode */
    syntaxMode: IHighlightLanguage | I;
    /** Whether to enable rich content rendering (only works if the syntax mode is "text", "html" or "markdown") */
    showRichContent: boolean | I;
    /** The font size for this note */
    fontSize: number | I;
};
