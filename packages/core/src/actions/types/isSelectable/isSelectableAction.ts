import {createAction} from "../../createAction";

/**
 * An action that can be used to check whether an item is selectable. When applied to multiple items, the result will indicate whether any of the items indicate to be selectable, and none of them explicitly indicate not to be selectable.
 */
export const isSelectableAction = createAction({
    name: "is selectable",
    core: (data: boolean[]) => ({
        result: data.every(selectable => selectable) && data.length > 0,
    }),
});
