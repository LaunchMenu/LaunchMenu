import {searchAction} from "../searchAction";
import {ISimpleSearchData} from "./_types/ISimpleSearchData";
import {IQuery} from "../../../../menu/_types/IQuery";
import {ISimpleSearchQuery} from "./_types/ISimpleSearchQuery";
import {getSimpleSearchMatcher} from "../simpleSearch/SimpleSearchMatcher";
import {v4 as uuid} from "uuid";
import {IActionBinding} from "../../../_types/IActionBinding";
import {IDataHook} from "model-react";
import {IMenuSearchable} from "../_types/IMenuSearchable";
import {getHooked} from "../../../../../utils/subscribables/getHooked";
import {IPatternMatch} from "../../../../../utils/searchExecuter/_types/IPatternMatch";

/**
 * The weights for how importing matching name vs description vs tags is (higher = more important)
 */
export const simpleSearchWeights = {
    name: 1,
    description: 0.5,
    tags: 0.5,
};

/**
 * Retrieves the priority for the given item data
 * @param query The query to search for
 * @param data The data to search in
 * @returns The priority
 */
export function getSimplePriority(
    query: IQuery & Partial<ISimpleSearchQuery>,
    {
        name,
        description,
        tags,
    }: {
        name?: string | ((hook?: IDataHook) => string | undefined);
        description?: string | ((hook?: IDataHook) => string | undefined);
        tags?: string[] | ((hook?: IDataHook) => string[] | undefined);
    },
    hook?: IDataHook
): number {
    const matcher = getSimpleSearchMatcher(query);
    let priority = 0;

    if (name)
        priority += matcher.match(getHooked(name, hook) ?? "") * simpleSearchWeights.name;

    if (description)
        priority +=
            matcher.match(getHooked(description, hook) ?? "") *
            simpleSearchWeights.description;

    if (tags)
        (getHooked(tags, hook) ?? []).forEach(
            tag => (priority += matcher.match(tag) * simpleSearchWeights.tags)
        );
    return priority;
}

/**
 * A search handler that performs simple searches based off a regex match of a number of fields.
 * If multiple items are bound to 1 simple search data object, only the first item will be used.
 */
export const simpleSearchHandler = searchAction.createHandler(
    (data: ISimpleSearchData[], dataItems) => {
        // Map all the search data
        return data.flatMap(({children: childItemsGetter, id, ...data}, i):
            | IMenuSearchable
            | IMenuSearchable[] => {
            const item = dataItems[i][0];
            return {
                ID: id,
                search: async (
                    query: IQuery & Partial<ISimpleSearchQuery>,
                    hook: IDataHook
                ) => {
                    const priority = getSimplePriority(query, data, hook);
                    const childItems = getHooked(childItemsGetter, hook);
                    const children = childItems && searchAction.get(childItems);
                    const patternMatch = data.patternMatcher?.(query, hook);
                    return {
                        item: priority > 0 ? {priority, ID: id, item} : undefined,
                        children,
                        patternMatch,
                    };
                },
            };
        });
    }
);

/**
 * Creates a search binding including a newly generated id for an item
 * @param data The binding data
 * @returns The created binding
 */
export function createSimpleSearchBinding(
    data: Omit<ISimpleSearchData, "id">
): IActionBinding<ISimpleSearchData> {
    return simpleSearchHandler.createBinding({id: uuid(), ...data});
}
