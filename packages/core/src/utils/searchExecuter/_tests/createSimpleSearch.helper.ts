import {IDataHook} from "model-react";
import {v4 as uuid} from "uuid";
import {IPatternMatch} from "../_types/IPatternMatch";
import {ISearchable} from "../_types/ISearchable";

export const createSimpleSearch = ({
    id = uuid(),
    m: matches,
    pattern,
    children,
}: {
    /** The UUID for the searchable */
    id?: string;
    /** Whether the search matches */
    m?: (text: string, hook?: IDataHook) => boolean | Promise<boolean>;
    /** The children */
    children?:
        | ISearchable<string, string>[]
        | ((
              text: string,
              hook?: IDataHook
          ) => ISearchable<string, string>[] | Promise<ISearchable<string, string>[]>);
    /** A function to match patterns */
    pattern?: (text: string, hook: IDataHook) => IPatternMatch | undefined;
}): ISearchable<string, string> => ({
    ID: id,
    async search(query, hook) {
        return {
            item: (await matches?.(query, hook)) ? id : undefined,
            children:
                children instanceof Function ? await children(query, hook) : children,
            patternMatch: pattern?.(query, hook),
        };
    },
});
