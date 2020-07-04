import {onCursorAction} from "./onCursorAction";

/**
 * The standard on cursor handler that calls the cursor
 */
export const onCursorHandler = onCursorAction.createHandler(
    (data: ((isCursor: boolean) => void)[]) => {
        return isCursor => data.forEach(f => f(isCursor));
    }
);
