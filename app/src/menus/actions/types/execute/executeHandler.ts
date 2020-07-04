import {executeAction} from "./executeAction";

/**
 * The standard execution handler that simply calls the execution function
 */
export const executeHandler = executeAction.createHandler((data: (() => void)[]) => {
    return () => data.forEach(f => f());
});
