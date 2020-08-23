import {sequentialExecuteHandler} from "../../../menus/actions/types/execute/sequentialExecuteHandler";
import {results} from "../../../menus/actions/Action";
import {ICommand} from "../../../undoRedo/_types/ICommand";
import {openUI} from "../../../context/openUI/openUI";
import {SetFieldCommand} from "../../../undoRedo/commands/SetFieldCommand";
import {IActionBinding} from "../../../menus/actions/_types/IActionBinding";
import {ITagsOverride} from "../../../menus/actions/_types/ITagsOverride";
import {IExecutable} from "../../../menus/actions/types/execute/_types/IExecutable";
import {IAction} from "../../../menus/actions/_types/IAction";
import {IActionMultiResult} from "../../../menus/actions/_types/IActionMultiResult";
import {TReplace} from "../../../_types/TReplace";
import {ISelectFieldExecuteData} from "./_types/ISelectFieldExecuteData";
import {SelectField} from "./SelectField";

/**
 * A handler to let users alter a field
 */
export const selectFieldExecuteHandler = sequentialExecuteHandler.createHandler(
    (data: ISelectFieldExecuteData<unknown>[]) => ({
        [results]: data.map(
            ({field: fieldGetter, config, highlighter, context, undoable}) => ({
                execute: () =>
                    new Promise<ICommand | void>(res => {
                        let closeUI = () => {};
                        let changed: boolean = false;
                        let value;

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
                        closeUI = openUI(
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
    IAction<ISelectFieldExecuteData<unknown>, IActionMultiResult<IExecutable>>,
    {
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
