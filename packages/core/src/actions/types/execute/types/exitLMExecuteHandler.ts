import {createAction} from "../../../createAction";
import {sequentialExecuteHandler} from "../sequentialExecuteHandler";
import {IExecuteArg} from "../_types/IExecuteArg";
import {IExitCallbackResponse, IExitLMExecuteData} from "./_types/IExitLMExecuteData";

/** An execute handler that can be used to exit LM, execute a callback, and possibly open LM backup if the UI changed or a callback requested it */
export const exitLMExecuteHandler = createAction({
    name: "Exit Launchmenu",
    parents: [sequentialExecuteHandler],
    core: (onExit: IExitLMExecuteData[]) => {
        /**
         * Exits LM, performs some action, and potentially opens LM again
         * @param context The context data for the callbacks
         * @returns A promise that resolves when the actions have executed
         */
        const execute = async ({context}: IExecuteArg) => {
            // Exit the LM window
            const {session} = context;
            // await session?.LM.setWindowOpen(false);

            // Execute all on exit handlers
            const results = await Promise.all(
                onExit.map(data => (data ? data({context}) : undefined))
            );
            const resultObjects = results.filter(
                (result): result is Exclude<IExitCallbackResponse, void> => !!result
            );

            const reopen = resultObjects.some(item => item.reopen);
            const forceClose = resultObjects.some(item => item.forceClose);
            const preventGoHome = resultObjects.some(item => item.preventGoHome);

            // Check whether any UI was opened some time after this resolved
            const layers = context.getUI();
            setTimeout(() => {
                // Check if the UI changed
                const UIChanged = context.getUI().some(layer => !layers.includes(layer));

                // Potentially open LM again, or potentially go home in the session
                const open = !forceClose && (reopen || UIChanged);
                if (open) session?.LM.setWindowOpen(true);
                else if (!preventGoHome) session?.goHome();
            }, 200);
        };
        return {
            execute,
            children: [sequentialExecuteHandler.createBinding(execute)],
        };
    },
});
