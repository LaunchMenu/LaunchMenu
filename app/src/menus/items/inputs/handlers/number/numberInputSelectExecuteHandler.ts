import {checkTextNumberConstraints} from "./checkTextNumberConstraints";
import {INumberInputSelectExecuteData} from "./_types/INumberInputSelectExecuteData";
import {results} from "../../../../actions/Action";
import {selectFieldExecuteHandler} from "../../../../../textFields/types/selectField/selectFieldExecuteHandler";
import {ISelectFieldExecuteData} from "../../../../../textFields/types/selectField/_types/ISelectFieldExecuteData";
import {createStandardMenuItem} from "../../../createStandardMenuItem";

/**
 * A simple execute handler for updating numeric fields, allowing the choice of multiple options
 */
export const numberInputSelectExecuteHandler = selectFieldExecuteHandler.createHandler(
    (data: INumberInputSelectExecuteData[]) => ({
        [results]: data.map(
            ({
                field,
                liveUpdate,
                undoable,
                options,
                allowCustomInput,
                ...rest
            }): ISelectFieldExecuteData<number> => ({
                field,
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
