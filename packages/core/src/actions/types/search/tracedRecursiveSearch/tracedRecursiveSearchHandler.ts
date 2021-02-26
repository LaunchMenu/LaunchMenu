import {createAction} from "../../../createAction";
import {IActionBinding} from "../../../_types/IActionBinding";
import {IActionTarget} from "../../../_types/IActionTarget";
import {identityAction} from "../../identity/identityAction";
import {getSearchIdentity, searchAction} from "../searchAction";
import {IMenuSearchable} from "../_types/IMenuSearchable";
import {openAtTraceAction} from "./openAtTraceAction";
import {openInParentAction} from "./openInParentAction";
import {ISearchTraceNode} from "./_types/ISearchTraceNode";
import {ITracedRecursiveSearchData} from "./_types/ITracedRecursiveSearchData";

/**
 * An action to recursively search within menus, while tracking the location
 */
export const tracedRecursiveSearchHandler = createAction({
    name: "search",
    parents: [searchAction],
    core: (searchers: ITracedRecursiveSearchData[], _1, _2, targets) => {
        const result = {
            /**
             * Retrieves the recursive searches, which keep track of the trace they came from
             * @param getTrace Retrieves the trace so far
             * @returns The searchables
             */
            getSearchables: (getTrace: () => ISearchTraceNode[]): IMenuSearchable[] =>
                searchers.map(data =>
                    getMenuSearchableFromTracedRecursiveSearchData(
                        getTrace,
                        data,
                        targets
                    )
                ),
        };
        return {
            result,
            children: result
                .getSearchables(() => [])
                .map(searcher => searchAction.createBinding(searcher)),
        };
    },
});

/**
 * Retrieves a standard searchable given a trace retriever and
 * @param getTrace THe trace retriever
 * @param searchData The searchable data
 * @param targets The list of action targets that this searchable was obtained from
 * @returns The menu searchable
 */
export function getMenuSearchableFromTracedRecursiveSearchData(
    getTrace: () => ISearchTraceNode[],
    searchData: ITracedRecursiveSearchData,
    targets: IActionTarget[]
): IMenuSearchable {
    if ("itemID" in searchData) {
        const {itemID, search, ID, children, showChild} = searchData;
        return {
            ID,
            async search(query, hook, executer) {
                // Define a function to get the item that this search ran on
                const getItem = () => getSearchIdentity(itemID, query, targets, hook);

                // Perform the search function
                const {
                    item,
                    patternMatch,
                    children: originalChildren = [],
                } = await search(query, getItem, hook, executer);

                // Define a function to get the trace for this item
                const getExtendedTrace = () => {
                    const item = getItem();
                    return item ? [...getTrace(), {item, showChild}] : getTrace();
                };

                // Recursively retrieve the child searchers
                // TODO: consider also adding other search actions, without the trace data
                const childSearches =
                    (children &&
                        tracedRecursiveSearchHandler
                            .get(
                                children instanceof Function
                                    ? children(query, hook)
                                    : children
                            )
                            .getSearchables(getExtendedTrace)) ??
                    [];

                // Get the extra bindings for the item
                const locationBindings = (bindings: IActionBinding[]) => {
                    const trace = getExtendedTrace();
                    if (trace.length < 2) return bindings;
                    return [
                        ...bindings,
                        openAtTraceAction.createBinding(trace),
                        openInParentAction.createBinding(trace),
                    ];
                };

                return {
                    item: item
                        ? identityAction.copyPrioritizedItem(item, locationBindings)
                        : item,
                    patternMatch,
                    children: [...originalChildren, ...childSearches],
                };
            },
        };
    } else {
        return searchData(getTrace);
    }
}
