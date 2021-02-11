import {createAction, createStandardBinding} from "../../createAction";
import {IActionBinding} from "../../_types/IActionBinding";
import {
    IBindingCreatorConfig,
    IBindingCreatorConfigOrData,
} from "../../_types/IBindingCreator";
import {executeAction} from "../execute/executeAction";
import {IExecuteArg} from "../execute/_types/IExecuteArg";
import {copyTextHandler} from "./copy/handlers/copyTextHandler";
import {OSPasteHandler} from "./paste/handlers/OSPasteHandler/OSPasteHandler";
import {exitLMExecuteHandler} from "../execute/types/exitLMExecuteHandler";
import {TIsBindingForAction} from "../../utils/_types/TIsBindingForAction";
import {copyExecuteHandler} from "./copy/copyExecuteHandler";
import {pasteExecuteHandler} from "./paste/pasteExecuteHandler";
import {ICopyExitPasteData} from "./_types/ICopyExitPasteData";
import {IAction} from "../../_types/IAction";
import {createContextAction} from "../../contextMenuAction/createContextAction";

/** A copy execute handler that uses electron's clipboard
 * @remark
 * Note that if a paste handler is specified, it's recommended to retrieve its contents from elsewhere than the OS's clipboard. Otherwise the same content may be pasted twice if multiple items are selected. A virtual clipboard with appropriate copy and paste handlers could be used to handle this.
 */
export const copyExitPasteHandler = createContextAction({
    name: "Copy exit paste",
    contextItem: {
        priority: executeAction.priority,
        icon: "copy",
    },
    parents: [exitLMExecuteHandler],
    core: (data: ICopyExitPasteData[]) => {
        /**
         * Performs the copy and paste actions, without exiting LM
         * @param context The execute context data
         */
        const executeCopyAndPaste = ({context}: Pick<IExecuteArg, "context">) => {
            // Normalize the copy and paste bindings
            const copyBindings = data.map(d =>
                typeof d == "string"
                    ? copyTextHandler.createBinding(d)
                    : typeof d.copy == "string"
                    ? copyTextHandler.createBinding(d.copy)
                    : d.copy
            );
            const pasteBindings = data.map(d =>
                typeof d != "string" && d.paste ? d.paste : OSPasteHandler.createBinding()
            );

            // Perform the copy and paste bindings
            executeAction.execute(context, [{actionBindings: copyBindings}]);
            executeAction.execute(context, [{actionBindings: pasteBindings}]);

            // Combine the response data for LM execute handler
            const reopen = data.some(item => typeof item != "string" && item.reopen);
            const forceClose = data.some(
                item => typeof item != "string" && item.forceClose
            );
            const preventGoHome = data.some(
                item => typeof item != "string" && item.preventGoHome
            );
            return {reopen, forceClose, preventGoHome};
        };

        return {
            result: {
                executeCopyAndPaste,
            },
            children: [exitLMExecuteHandler.createBinding(executeCopyAndPaste)],
        };
    },

    createBinding: createStandardBinding as {
        // TODO: maybe rethink going overboard with type defs like this...
        /**
         * Creates a binding for the copy exit paste handler, this can be a string for simple behavior, or dedicated copy and paste bindings
         * @param config The data for the binding, and optionally extra configuration
         * @returns The created binding
         */
        <B extends IBindingCreatorConfigOrData<ICopyExitPasteData>>(
            config: B &
                (B extends {copy: infer B1; paste?: infer B2}
                    ? (B1 extends IActionBinding
                          ? {copy: TIsBindingForAction<B1, typeof copyExecuteHandler>}
                          : unknown) &
                          (B2 extends IActionBinding
                              ? {
                                    paste: TIsBindingForAction<
                                        B2,
                                        typeof pasteExecuteHandler
                                    >;
                                }
                              : unknown)
                    : B extends IBindingCreatorConfig<{copy: infer B1; paste: infer B2}>
                    ? (B1 extends IActionBinding
                          ? IBindingCreatorConfig<{
                                copy: TIsBindingForAction<B1, typeof copyExecuteHandler>;
                            }>
                          : unknown) &
                          (B2 extends IActionBinding
                              ? IBindingCreatorConfig<{
                                    paste: TIsBindingForAction<
                                        B2,
                                        typeof pasteExecuteHandler
                                    >;
                                }>
                              : unknown)
                    : unknown)
        ): IActionBinding<
            IAction<
                ICopyExitPasteData,
                {
                    executeCopyAndPaste: ({
                        context,
                    }: Pick<IExecuteArg, "context">) => {
                        reopen: boolean;
                        forceClose: boolean;
                        preventGoHome: boolean;
                    };
                },
                typeof exitLMExecuteHandler
            >
        >;
    },
});
