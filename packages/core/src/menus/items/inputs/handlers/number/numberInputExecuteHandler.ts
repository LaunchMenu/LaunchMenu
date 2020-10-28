import {INumberInputExecuteData} from "./_types/INumberInputExecuteData";
import {checkTextNumberConstraints} from "./checkTextNumberConstraints";
import {results} from "../../../../actions/Action";
import {IInputExecuteData} from "../../../../../uiLayers/types/input/_types/IInputExecuteData";
import {inputExecuteHandler} from "../../../../../uiLayers/types/input/inputExecuteHandler";

/**
 * A simple execute handler for updating numeric fields
 */
export const numberInputExecuteHandler = inputExecuteHandler.createHandler(
    (data: INumberInputExecuteData[]) => ({
        [results]: data.map(
            ({field, liveUpdate, undoable, ...rest}): IInputExecuteData<number> => ({
                field,
                undoable,
                liveUpdate,
                serialize: number => number.toString(),
                deserialize: text => Number(text),
                checkValidity: text => checkTextNumberConstraints(text, rest),
            })
        ),
    })
);
