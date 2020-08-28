import {sequentialExecuteHandler} from "../../../menus/actions/types/execute/sequentialExecuteHandler";
import {IMultiSelectFieldExecuteData} from "./_types/IMultiSelectFieldExecuteData";
import {TReplace} from "../../../_types/TReplace";
import {IAction} from "../../../menus/actions/_types/IAction";
import {IActionMultiResult} from "../../../menus/actions/_types/IActionMultiResult";
import {IExecutable} from "../../../menus/actions/types/execute/_types/IExecutable";
import {IActionCore} from "../../../menus/actions/_types/IActionCore";
import {ITagsOverride} from "../../../menus/actions/_types/ITagsOverride";
import {IActionBinding} from "../../../menus/actions/_types/IActionBinding";
import {results} from "../../../menus/actions/Action";
import {ICommand} from "../../../undoRedo/_types/ICommand";
import {MultiSelectField} from "./MultiSelectField";
import {SetFieldCommand} from "../../../undoRedo/commands/SetFieldCommand";
import {openUI} from "../../../context/openUI/openUI";

/**
 * A handler to let users alter a field
 */
export const multiSelectFieldExecuteHandler = sequentialExecuteHandler.createHandler(
    (data: IMultiSelectFieldExecuteData<unknown>[]) => ({
        [results]: data.map(
            ({
                field: fieldGetter,
                config,
                highlighter,
                context,
                undoable,
                openUI: customOpenUI,
            }) => ({
                execute: () =>
                    new Promise<ICommand | void>(res => {
                        let closeUI = () => {};
                        let changed: boolean = false;
                        let value;

                        // Create the dropdown field
                        const field =
                            fieldGetter instanceof Function ? fieldGetter() : fieldGetter;
                        let dropdownField = new MultiSelectField(
                            field,
                            context,
                            config as any,
                            v => {
                                changed = true;
                                value = v;
                                closeUI();
                            }
                        );

                        // Create UI on close handler
                        const onClose = () => {
                            if (changed) {
                                if (undoable) {
                                    res(new SetFieldCommand(field, value));
                                    return;
                                } else field.set(value);
                            }
                            res();
                        };

                        // Open the field
                        closeUI = (customOpenUI ?? openUI)(
                            context,
                            {
                                field: dropdownField,
                                // TODO: add field with input styling
                                highlighter: dropdownField.getHighlighterWithError(
                                    highlighter
                                ),
                            },
                            onClose
                        );
                    }),
            })
        ),
    })
) as TReplace<
    // Cast to get improved error checking with template parameter
    IAction<IMultiSelectFieldExecuteData<unknown>, IActionMultiResult<IExecutable>>,
    {
        /**
         * Creates a new handler for this action, specifying how this action can be executed
         * @param handlerCore The function describing the execution process
         * @param defaultTags The default tags that bindings of these handlers should have, this action's default tags are inherited if left out
         * @returns The created action handler
         */
        createHandler<T, K>(
            handlerCore: IActionCore<T, IMultiSelectFieldExecuteData<K>>,
            defaultTags?: ITagsOverride
        ): IAction<T, IMultiSelectFieldExecuteData<K>>;

        /**
         * Creates a new handler for this action, specifying how this action can be executed
         * @param handlerCore The function describing the execution process
         * @param defaultTags The default tags that bindings of these handlers should have, this action's default tags are inherited if left out
         * @returns The created action handler
         */
        createHandler<T, K>(
            handlerCore: IActionCore<
                T,
                IActionMultiResult<IMultiSelectFieldExecuteData<K>>
            >,
            defaultTags?: ITagsOverride
        ): IAction<T, IActionMultiResult<IMultiSelectFieldExecuteData<K>>>;

        /**
         * Creates a binding for this action handler
         * @param data The field configuration data
         * @param tags The tags to include in the binding
         * @returns The action binding
         */
        createBinding<T>(
            data: IMultiSelectFieldExecuteData<T>,
            tags?: ITagsOverride
        ): IActionBinding<IMultiSelectFieldExecuteData<T>>;
    }
>;
