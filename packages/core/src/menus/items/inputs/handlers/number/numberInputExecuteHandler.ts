import {INumberInputExecuteData} from "./_types/INumberInputExecuteData";
import {checkTextNumberConstraints} from "./checkTextNumberConstraints";
import {inputExecuteHandler} from "../../../../../uiLayers/types/input/inputExecuteHandler";
import {createAction} from "../../../../../actions/createAction";

/**
 * A simple execute handler for updating numeric fields
 */
export const numberInputExecuteHandler = createAction({
    name: "number input",
    parents: [inputExecuteHandler],
    core: (data: INumberInputExecuteData[]) => ({
        children: data.map(({field, liveUpdate, undoable, ...rest}) =>
            inputExecuteHandler.createBinding<number>({
                field,
                undoable,
                liveUpdate,
                serialize: number => number.toString(),
                deserialize: text => Number(text),
                checkValidity: text => checkTextNumberConstraints(text, rest),
            })
        ),
    }),
});
