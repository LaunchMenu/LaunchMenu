import {Action} from "../../Action";
import {IActionHandlerItems} from "../../_types/IActionHandlerItems";

/**
 * The default execute action of any menu item
 */
export const executeAction = new Action((handlers: IActionHandlerItems<() => void>) => {
    return {
        execute: () => {
            handlers.forEach(({handler, data}) => {
                return handler.get(data)();
            });
        },
    };
});
