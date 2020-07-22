import {searchAction} from "../searchAction";
import {ISimpleSearchData} from "./_types/ISimpleSearchData";
import {IQuery} from "../../../../menu/_types/IQuery";
import {ISimpleSearchQuery} from "./_types/ISimpleSearchQuery";
import {getSimpleSearchMatcher} from "../simpleSearch/SimpleSearchMatcher";
import {v4 as uuid} from "uuid";
import {IActionBinding} from "../../../_types/IActionBinding";

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
    {name, description, tags}: {name?: string; description?: string; tags?: string[]}
): number {
    const matcher = getSimpleSearchMatcher(query);
    let priority = 0;
    if (name) priority += matcher.match(name) * simpleSearchWeights.name;
    if (description)
        priority += matcher.match(description) * simpleSearchWeights.description;
    if (tags)
        tags.forEach(tag => (priority += matcher.match(tag) * simpleSearchWeights.tags));
    return priority;
}

/**
 * A search handler that performs simple searches based off a regex match of a number of fields
 */
export const simpleSearchHandler = searchAction.createHandler(
    (data: ISimpleSearchData[], dataItems) => {
        return {
            search: async (query: IQuery & Partial<ISimpleSearchQuery>, cb) => {
                data.forEach(({children, ids, ...data}, i) => {
                    const items = dataItems[i];
                    const priority = getSimplePriority(query, data);

                    // Perform the callback for all items
                    if (priority > 0)
                        items.forEach((item, i) => {
                            cb({
                                id: ids[i],
                                priority,
                                item,
                                getUpdatedPriority: async newQuery =>
                                    getSimplePriority(newQuery, data),
                            });
                        });

                    // Recurse on any passed children
                    if (children) return searchAction.get(children).search(query, cb);
                });
            },
        };
    }
);

/**
 * Creates a search binding including a newly generated id for an item
 * @param data The binding data
 * @returns The created binding
 */
export function createSimpleSearchBinding(
    data: Omit<ISimpleSearchData, "ids">
): IActionBinding<ISimpleSearchData> {
    return simpleSearchHandler.createBinding({ids: [uuid()], ...data});
}
