import {IQuery} from "../../../../menus/menu/_types/IQuery";
import {IHighlightNode} from "../../../../textFields/syntax/_types/IHighlightNode";
import {TPartialBy} from "../../../../_types/TPartialBy";

/**
 * A search highlighter
 */
export type ISearchHighlighter = (
    /** The text to be highlighted */
    text: string,
    /** The query to highlight with */
    query: IQuery
) => /** The sections to be highlighted */ ISearchHighlighterNode[];

/**
 * The search result node
 */
export type ISearchHighlighterNode = TPartialBy<IHighlightNode, "tags" | "text">;
