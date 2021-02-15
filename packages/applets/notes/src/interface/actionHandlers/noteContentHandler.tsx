import {
    adjustBindingInput,
    Content,
    ContentView,
    createAction,
    createStandardContentKeyHandler,
    createStandardBinding,
    getContentAction,
    IAction,
    IActionBinding,
    IBindingCreatorConfig,
    IIdentifiedItem,
    IUUID,
    LFC,
} from "@launchmenu/core";
import {v4 as uuid} from "uuid";
import React from "react";
import {Note} from "../../dataModel/Note";
import {ContentSyntaxEditor} from "../content/ContentSyntaxEditor";
import {useDataHook} from "model-react";
import {ContentPlainText} from "../content/ContentPlainText";
import {ContentMarkdown} from "../content/ContentMarkdown";
import {ContentHtml} from "../content/ContentHtml";

/**
 * A handler that attaches scrollable content to items
 */
export const noteContentHandler = createAction({
    name: "scrollable note content handler",
    parents: [getContentAction],
    core: (contents: IIdentifiedItem<Note>[]) => ({
        result: contents,
        children: contents.map(({ID, value: note}) =>
            getContentAction.createBinding(context => {
                const content = new Content(<NoteContent note={note} />);
                const handler = createStandardContentKeyHandler(content, context);
                const view = <ContentView plain content={content} />;
                return {content, contentView: view, contentHandler: handler};
            }, ID)
        ),
    }),

    /**
     * Creates a new action binding and generates an ID for this item identity
     * @param config The data for the binding, and optionally extra configuration
     * @param ID The ID for this item
     * @returns The created binding with the identity key
     */
    createBinding: function (
        config: Note | IBindingCreatorConfig<Note>,
        ID: IUUID = uuid()
    ): IActionBinding<IAction<IIdentifiedItem<Note>, IIdentifiedItem<Note>[]>> {
        return createStandardBinding.call(
            this,
            adjustBindingInput(config, data => ({ID, value: data}))
        );
    },
});

/**
 * The content component that uses the correct content component type
 */
export const NoteContent: LFC<{note: Note}> = ({note}) => {
    const [hook] = useDataHook();

    // If rich content is enabled, show the appropriate rich content
    if (note.getShowRichContent(hook)) {
        const language = note.getSyntaxMode(hook).toLowerCase();
        if (language == "text") return <ContentPlainText note={note} />;
        if (language == "markdown") return <ContentMarkdown note={note} />;
        if (language == "html") return <ContentHtml note={note} />;
    }

    // Default to a syntax editor if there is no rich content or in the other language
    return <ContentSyntaxEditor note={note} />;
};
