import {sequentialExecuteHandler} from "../../../menus/actions/types/execute/sequentialExecuteHandler";
import {results} from "../../../menus/actions/Action";
import {ICommand} from "../../../undoRedo/_types/ICommand";
import {SetFieldCommand} from "../../../undoRedo/commands/SetFieldCommand";
import {IActionBinding} from "../../../menus/actions/_types/IActionBinding";
import {ITagsOverride} from "../../../menus/actions/_types/ITagsOverride";
import {IExecutable} from "../../../menus/actions/types/execute/_types/IExecutable";
import {IAction} from "../../../menus/actions/_types/IAction";
import {IActionMultiResult} from "../../../menus/actions/_types/IActionMultiResult";
import {TReplace} from "../../../_types/TReplace";
import {ISelectFieldExecuteData} from "./_types/ISelectFieldExecuteData";
import {SelectField} from "./SelectField";
import {IActionCore} from "../../../menus/actions/_types/IActionCore";
import {INonFunction} from "../../../_types/INonFunction";

/**
 * A handler to let users alter a field
 */
export const selectFieldExecuteHandler = sequentialExecuteHandler.createHandler(
    (data: ISelectFieldExecuteData<unknown>[]) => ({
        [results]: data.map(
            ({
                field: fieldGetter,
                config,
                highlighter,
                undoable,
                openUI: customOpenUI,
            }): IExecutable => ({
                execute: ({context}) =>
                    new Promise<ICommand | void>(res => {
                        let closeUI = () => {};
                        let changed: boolean = false;
                        let value: any;

                        // Create the dropdown field
                        const field =
                            fieldGetter instanceof Function ? fieldGetter() : fieldGetter;
                        let dropdownField = new SelectField(
                            field,
                            context,
                            config as any,
                            (v, c) => {
                                changed = c;
                                value = v;
                                closeUI();
                            }
                        );

                        // Create UI on close handler
                        const onClose = () => {
                            if (changed) {
                                if (undoable) {
                                    if (!dropdownField.getError()) {
                                        res(new SetFieldCommand(field, value));
                                        return;
                                    }
                                } else field.set(value);
                            }
                            res();
                        };

                        // Open the field
                        // TODO: refactor to work with UILayers
                        // closeUI = (customOpenUI ?? openUI)(
                        //     context,
                        //     {
                        //         field: dropdownField,
                        //         // TODO: add field with input styling
                        //         highlighter: dropdownField.getHighlighterWithError(
                        //             highlighter
                        //         ),
                        //     },
                        //     onClose
                        // );
                    }),
            })
        ),
    })
) as TReplace<
    // Cast to get improved error checking with template parameter
    IAction<ISelectFieldExecuteData<unknown>, IActionMultiResult<IExecutable>>,
    {
        /**
         * Creates a new handler for this action, specifying how this action can be executed
         * @param handlerCore The function describing the execution process
         * @param defaultTags The default tags that bindings of these handlers should have, this action's default tags are inherited if left out
         * @returns The created action handler
         */
        createHandler<T extends INonFunction, K>(
            handlerCore: IActionCore<T, ISelectFieldExecuteData<K>>,
            defaultTags?: ITagsOverride
        ): IAction<T, ISelectFieldExecuteData<K>>;

        /**
         * Creates a new handler for this action, specifying how this action can be executed
         * @param handlerCore The function describing the execution process
         * @param defaultTags The default tags that bindings of these handlers should have, this action's default tags are inherited if left out
         * @returns The created action handler
         */
        createHandler<T extends INonFunction, K>(
            handlerCore: IActionCore<T, IActionMultiResult<ISelectFieldExecuteData<K>>>,
            defaultTags?: ITagsOverride
        ): IAction<T, IActionMultiResult<ISelectFieldExecuteData<K>>>;

        /**
         * Creates a binding for this action handler
         * @param data The field configuration data
         * @param tags The tags to include in the binding
         * @returns The action binding
         */
        createBinding<T>(
            data: ISelectFieldExecuteData<T>,
            tags?: ITagsOverride
        ): IActionBinding<ISelectFieldExecuteData<T>>;
    }
>;
