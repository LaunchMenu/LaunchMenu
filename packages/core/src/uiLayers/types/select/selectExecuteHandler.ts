import {results} from "../../../menus/actions/Action";
import {sequentialExecuteHandler} from "../../../menus/actions/types/execute/sequentialExecuteHandler";
import {IExecutable} from "../../../menus/actions/types/execute/_types/IExecutable";
import {IAction} from "../../../menus/actions/_types/IAction";
import {IActionBinding} from "../../../menus/actions/_types/IActionBinding";
import {IActionCore} from "../../../menus/actions/_types/IActionCore";
import {IActionMultiResult} from "../../../menus/actions/_types/IActionMultiResult";
import {ITagsOverride} from "../../../menus/actions/_types/ITagsOverride";
import {SetFieldCommand} from "../../../undoRedo/commands/SetFieldCommand";
import {ICommand} from "../../../undoRedo/_types/ICommand";
import {INonFunction} from "../../../_types/INonFunction";
import {TReplace} from "../../../_types/TReplace";
import {Select} from "./Select";
import {ISelectExecuteData} from "./_types/ISelectExecuteData";

/**
 * A handler to let users alter a field given a selection of options
 */
export const selectExecuteHandler = sequentialExecuteHandler.createHandler(
    (data: ISelectExecuteData<unknown>[]) => ({
        [results]: data.map(
            ({field, undoable, ...config}): IExecutable => ({
                execute: ({context}) =>
                    new Promise<ICommand | void>(res => {
                        let cmd: ICommand | undefined;
                        context.open(
                            new Select(field, {
                                ...config,
                                onSubmit: undoable
                                    ? result => {
                                          cmd = new SetFieldCommand(field, result);
                                      }
                                    : undefined,
                            }),
                            () => {
                                res(cmd);
                            }
                        );
                    }),
            })
        ),
    })
) as TReplace<
    // Cast to get improved error checking with template parameter
    IAction<ISelectExecuteData<unknown>, IActionMultiResult<IExecutable>>,
    {
        /**
         * Creates a new handler for this action, specifying how this action can be executed
         * @param handlerCore The function describing the execution process
         * @param defaultTags The default tags that bindings of these handlers should have, this action's default tags are inherited if left out
         * @returns The created action handler
         */
        createHandler<T extends INonFunction, K>(
            handlerCore: IActionCore<T, ISelectExecuteData<K>>,
            defaultTags?: ITagsOverride
        ): IAction<T, ISelectExecuteData<K>>;

        /**
         * Creates a new handler for this action, specifying how this action can be executed
         * @param handlerCore The function describing the execution process
         * @param defaultTags The default tags that bindings of these handlers should have, this action's default tags are inherited if left out
         * @returns The created action handler
         */
        createHandler<T extends INonFunction, K>(
            handlerCore: IActionCore<T, IActionMultiResult<ISelectExecuteData<K>>>,
            defaultTags?: ITagsOverride
        ): IAction<T, IActionMultiResult<ISelectExecuteData<K>>>;

        /**
         * Creates a binding for this action handler
         * @param data The field configuration data
         * @param tags The tags to include in the binding
         * @returns The action binding
         */
        createBinding<T>(
            data: ISelectExecuteData<T>,
            tags?: ITagsOverride
        ): IActionBinding<ISelectExecuteData<T>>;
    }
>;
