import {getHooked} from "../../../../utils/subscribables/getHooked";
import {createAction} from "../../../createAction";
import {IActionBinding} from "../../../_types/IActionBinding";
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
            getSearchables: (getTrace: () => ISearchTraceNode[]): IMenuSearchable[] => {
                return searchers.map(
                    ({itemID, searchable: search, children, showChild}) => ({
                        ID: search.ID,
                        async search(query, hook, executer) {
                            const {
                                item,
                                patternMatch,
                                children: originalChildren = [],
                            } = await search.search(query, hook, executer);

                            // Get the trace for this item
                            const getExtendedTrace = () => {
                                const item = getSearchIdentity(
                                    itemID,
                                    query,
                                    targets,
                                    hook
                                );
                                return item
                                    ? [...getTrace(), {item, showChild}]
                                    : getTrace();
                            };

                            // Recursively retrieve the child searchers
                            const childSearches =
                                (children &&
                                    tracedRecursiveSearchHandler
                                        .get(getHooked(children, hook))
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
                                    ? identityAction.copyPrioritizedItem(
                                          item,
                                          locationBindings
                                      )
                                    : item,
                                patternMatch,
                                children: [...originalChildren, ...childSearches],
                            };
                        },
                    })
                );
            },
        };
        return {
            result,
            children: result
                .getSearchables(() => [])
                .map(searcher => searchAction.createBinding(searcher)),
        };
    },
});
