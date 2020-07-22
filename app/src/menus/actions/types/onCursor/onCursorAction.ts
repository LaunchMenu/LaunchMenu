import {Action} from "../../Action";

/**
 * An action that's use as an event listener for when an item becomes the cursor
 */
export const onCursorAction = new Action((listeners: ((isCursor: boolean) => void)[]) => {
    return {
        onCursor: (isCursor: boolean) => {
            listeners.forEach(listener => listener(isCursor));
        },
    };
});
