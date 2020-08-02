import {Action} from "../../Action";
import {ICursorSelectable} from "./_types/ICursorSelectable";
import {IMenu} from "../../../menu/_types/IMenu";

/**
 * An action that's used as an event listener for when an item becomes the cursor
 */
export const onCursorAction = new Action((listeners: ICursorSelectable[]) => {
    return {
        onCursor: (isCursor, menu) =>
            listeners.forEach(selectable => selectable.onCursor(isCursor, menu)),
    } as ICursorSelectable;
});
