import {Action} from "../../Action";

/**
 * The default execute action of any menu item
 */
export const executeAction = new Action((executors: (() => void)[]) => {
    return {
        execute: () => {
            executors.forEach(executor => executor());
        },
    };
});
