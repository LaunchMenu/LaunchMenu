import {INumberInputExecuteData} from "./_types/INumberInputExecuteData";
import {checkTextNumberConstraints} from "./checkTextNumberConstraints";
import {promptInputExecuteHandler} from "../../../../../uiLayers/types/input/promptInputExecuteHandler";
import {createAction} from "../../../../../actions/createAction";

/**
 * A simple execute handler for updating numeric fields
 */
export const promptNumberInputExecuteHandler = createAction({
    name: "number input",
    parents: [promptInputExecuteHandler],
    core: (data: INumberInputExecuteData[]) => ({
        children: data.map(({field, liveUpdate, undoable, ...rest}) =>
            promptInputExecuteHandler.createBinding<number>({
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
