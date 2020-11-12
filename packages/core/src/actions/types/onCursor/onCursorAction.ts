import {createAction} from "../../createAction";
import {ICursorSelectable} from "./_types/ICursorSelectable";

/**
 * An action that's used as an event listener for when an item becomes the cursor
 */
export const onCursorAction = createAction({
    name: "on cursor event",
    core: (listeners: ICursorSelectable[]) => ({
        result: {
            onCursor: ((isCursor, menu) =>
                listeners.forEach(onSelect =>
                    onSelect(isCursor, menu)
                )) as ICursorSelectable,
        },
    }),
});
