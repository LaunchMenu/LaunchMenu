import {Action} from "../../Action";

/**
 * A action to inform item(s) it is now the cursor
 */
export const onCursorAction = new Action((listeners: ((isCursor: boolean) => void)[]) => {
    return {
        onCursor: (isCursor: boolean) => {
            listeners.forEach(listener => listener(isCursor));
        },
    };
});
