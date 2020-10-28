import {ISearchable, ISearchableResult} from "./_types/ISearchable";
import {ISearchableAdjuster} from "./_types/ISearchAdjuster";

/**
 * Alters the result returned by a searchable
 * @param searchable The searchable to modify
 * @param modify The modifier function
 * @param recurse Whether to recursively apply this adjuster to the retrieved children
 * @returns A new searchable
 */
export function adjustSearchable<Q, I>(
    searchable: ISearchable<Q, I>,
    modify: ISearchableAdjuster<Q, I>,
    recurse: boolean = true
): ISearchable<Q, I> {
    return {
        ID: searchable.ID,
        async search(query, hook, executer) {
            let original = await searchable.search(query, hook, executer);
            if (recurse && original.children)
                original = {
                    ...original,
                    children: original.children?.map(child =>
                        adjustSearchable(child, modify, recurse)
                    ),
                };

            const args = {query, hook, executer};
            if (modify instanceof Function) return await modify(original, args);
            return {
                item: modify.item
                    ? await modify.item(original.item, args)
                    : original.item,
                children: modify.children
                    ? await modify.children(original.children ?? [], args)
                    : original.children,
                patternMatch: modify.patternMatch
                    ? await modify.patternMatch(original.patternMatch, args)
                    : original.patternMatch,
            };
        },
    };
}
