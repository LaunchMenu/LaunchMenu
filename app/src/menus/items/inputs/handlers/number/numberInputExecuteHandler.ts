import {INumberInputExecuteData} from "./_types/INumberInputExecuteData";
import {checkTextNumberConstraints} from "./checkTextNumberConstraints";
import {inputFieldExecuteHandler} from "../../../../../textFields/types/inputField/InputFieldExecuteHandler";
import {results} from "../../../../actions/Action";
import {IInputFieldExecuteData} from "../../../../../textFields/types/inputField/_types/IInputFieldExecuteData";

/**
 * A simple execute handler for updating numeric fields
 */
export const numberInputExecuteHandler = inputFieldExecuteHandler.createHandler(
    (data: INumberInputExecuteData[]) => ({
        [results]: data.map(
            ({
                field,
                context,
                liveUpdate,
                undoable,
                ...rest
            }): IInputFieldExecuteData<number> => ({
                field,
                context,
                undoable: undoable as any, // Cast to ignore relation between liveUpdate and undoable
                config: {
                    liveUpdate,
                    serialize: number => number.toString(),
                    deserialize: text => Number(text),
                    checkValidity: text => checkTextNumberConstraints(text, rest),
                },
            })
        ),
    })
);
