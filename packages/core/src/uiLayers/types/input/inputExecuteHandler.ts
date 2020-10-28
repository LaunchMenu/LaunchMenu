import {sequentialExecuteHandler} from "../../../menus/actions/types/execute/sequentialExecuteHandler";
import {results} from "../../../menus/actions/Action";
import {IInputExecuteData} from "./_types/IInputExecuteData";
import {ICommand} from "../../../undoRedo/_types/ICommand";
import {IActionBinding} from "../../../menus/actions/_types/IActionBinding";
import {ITagsOverride} from "../../../menus/actions/_types/ITagsOverride";
import {IExecutable} from "../../../menus/actions/types/execute/_types/IExecutable";
import {IAction} from "../../../menus/actions/_types/IAction";
import {IActionMultiResult} from "../../../menus/actions/_types/IActionMultiResult";
import {TReplace} from "../../../_types/TReplace";
import {IActionCore} from "../../../menus/actions/_types/IActionCore";
import {INonFunction} from "../../../_types/INonFunction";
import {Input} from "./Input";
import {SetFieldCommand} from "../../../undoRedo/commands/SetFieldCommand";

/**
 * A handler to let users alter a field
 */
export const inputExecuteHandler = sequentialExecuteHandler.createHandler(
    (data: IInputExecuteData<unknown>[]) => ({
        [results]: data.map(
            ({field, undoable, ...config}): IExecutable => ({
                execute: ({context}) =>
                    new Promise<ICommand | void>(res => {
                        let cmd: ICommand | undefined;
                        context.open(
                            new Input(field, {
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
    IAction<IInputExecuteData<unknown>, IActionMultiResult<IExecutable>>,
    {
        /**
         * Creates a new handler for this action, specifying how this action can be executed
         * @param handlerCore The function describing the execution process
         * @param defaultTags The default tags that bindings of these handlers should have, this action's default tags are inherited if left out
         * @returns The created action handler
         */
        createHandler<T extends INonFunction, K>(
            handlerCore: IActionCore<T, IInputExecuteData<K>>,
            defaultTags?: ITagsOverride
        ): IAction<T, IInputExecuteData<K>>;

        /**
         * Creates a new handler for this action, specifying how this action can be executed
         * @param handlerCore The function describing the execution process
         * @param defaultTags The default tags that bindings of these handlers should have, this action's default tags are inherited if left out
         * @returns The created action handler
         */
        createHandler<T extends INonFunction, K>(
            handlerCore: IActionCore<T, IActionMultiResult<IInputExecuteData<K>>>,
            defaultTags?: ITagsOverride
        ): IAction<T, IActionMultiResult<IInputExecuteData<K>>>;

        /**
         * Creates a binding for this action handler
         * @param data The field configuration data
         * @param tags The tags to include in the binding
         * @returns The action binding
         */
        createBinding<T>(
            data: IInputExecuteData<T>,
            tags?: ITagsOverride
        ): IActionBinding<IInputExecuteData<T>>;
    }
>;
