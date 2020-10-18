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
import {MultiSelect} from "./MultiSelect";
import {IMultiSelectExecuteData} from "./_types/IMultiSelectExecuteData";

/**
 * A handler to let users alter a field with multiple values given a selection of options
 */
export const multiSelectExecuteHandler = sequentialExecuteHandler.createHandler(
    (data: IMultiSelectExecuteData<unknown>[]) => ({
        [results]: data.map(
            ({field, undoable, ...config}): IExecutable => ({
                execute: ({context}) =>
                    new Promise<ICommand | void>(res => {
                        let cmd: ICommand | undefined;
                        context.open(
                            new MultiSelect(field, {
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
    IAction<IMultiSelectExecuteData<unknown>, IActionMultiResult<IExecutable>>,
    {
        /**
         * Creates a new handler for this action, specifying how this action can be executed
         * @param handlerCore The function describing the execution process
         * @param defaultTags The default tags that bindings of these handlers should have, this action's default tags are inherited if left out
         * @returns The created action handler
         */
        createHandler<T extends INonFunction, K>(
            handlerCore: IActionCore<T, IMultiSelectExecuteData<K>>,
            defaultTags?: ITagsOverride
        ): IAction<T, IMultiSelectExecuteData<K>>;

        /**
         * Creates a new handler for this action, specifying how this action can be executed
         * @param handlerCore The function describing the execution process
         * @param defaultTags The default tags that bindings of these handlers should have, this action's default tags are inherited if left out
         * @returns The created action handler
         */
        createHandler<T extends INonFunction, K>(
            handlerCore: IActionCore<T, IActionMultiResult<IMultiSelectExecuteData<K>>>,
            defaultTags?: ITagsOverride
        ): IAction<T, IActionMultiResult<IMultiSelectExecuteData<K>>>;

        /**
         * Creates a binding for this action handler
         * @param data The field configuration data
         * @param tags The tags to include in the binding
         * @returns The action binding
         */
        createBinding<T>(
            data: IMultiSelectExecuteData<T>,
            tags?: ITagsOverride
        ): IActionBinding<IMultiSelectExecuteData<T>>;
    }
>;
