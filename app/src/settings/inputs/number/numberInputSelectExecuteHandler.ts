import {INumberInputExecuteData} from "./_types/INumberInputExecuteData";
import {inputFieldExecuteHandler} from "../../../textFields/types/inputField/InputFieldExecuteHandler";
import {IInputFieldExecuteData} from "../../../textFields/types/inputField/_types/IInputFieldExecuteData";
import {results} from "../../../menus/actions/Action";
import {checkTextNumberConstraints} from "./checkTextNumberConstraints";
import {selectFieldExecuteHandler} from "../../../textFields/types/selectField/selectFieldExecuteHandler";
import {ISelectFieldExecuteData} from "../../../textFields/types/selectField/_types/ISelectFieldExecuteData";
import {INumberInputSelectExecuteData} from "./_types/INumberInputSelectExecuteData";
import {createStandardMenuItem} from "../../../menus/items/createStandardMenuItem";

/**
 * A simple execute handler for updating numeric fields, allowing the choice of multiple options
 */
export const numberInputSelectExecuteHandler = selectFieldExecuteHandler.createHandler(
    (data: INumberInputSelectExecuteData[]) => ({
        [results]: data.map(
            ({
                field,
                context,
                liveUpdate,
                undoable,
                options,
                allowCustomInput,
                ...rest
            }): ISelectFieldExecuteData<number> => ({
                field,
                context,
                undoable: undoable as any, // Cast to ignore relation between liveUpdate and undoable
                config: {
                    options,
                    liveUpdate,
                    allowCustomInput: allowCustomInput as any,
                    serialize: number => number.toString(),
                    deserialize: text => Number(text),
                    checkValidity: text => checkTextNumberConstraints(text, rest),
                    createOptionView: v => createStandardMenuItem({name: v.toString()}),
                },
            })
        ),
    })
);
