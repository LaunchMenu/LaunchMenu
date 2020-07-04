import {Action} from "../../Action";
import {IActionHandlerItems} from "../../_types/IActionHandlerItems";

/**
 * A action to inform item(s) it is now the cursor
 */
export const onCursorAction = new Action(
    (handlers: IActionHandlerItems<(isCursor: boolean) => void>) => {
        return {
            onCursor: (isCursor: boolean) => {
                handlers.forEach(({handler, data}) => {
                    return handler.get(data)(isCursor);
                });
            },
        };
    }
);
