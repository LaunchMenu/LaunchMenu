import {IDataHook} from "model-react";
import {IQuery} from "../../../../menus/menu/_types/IQuery";
import {IHighlighter} from "../../../../textFields/syntax/_types/IHighlighter";
import {ITextSelection} from "../../../../textFields/_types/ITextSelection";
import {IPatternMatch} from "../../../../utils/searchExecuter/_types/IPatternMatch";

/** The standard search pattern config */
export type IStandardSearchPatternMatcherConfig = {
    /** The name of the pattern */
    name: string;
    /** The matcher to decide whether a query matches the pattern */
    matcher:
        | RegExp
        | ((
              query: IQuery,
              hook: IDataHook
          ) => RegExp | ITextSelection[] | Partial<IPatternMatch> | undefined);
    /** A syntax highlighter to use to highlight the search field */
    highlighter?: IHighlighter;
};
