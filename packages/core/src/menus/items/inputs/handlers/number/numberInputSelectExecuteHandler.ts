import {checkTextNumberConstraints} from "./checkTextNumberConstraints";
import {INumberInputSelectExecuteData} from "./_types/INumberInputSelectExecuteData";
import {createStandardMenuItem} from "../../../createStandardMenuItem";
import {selectExecuteHandler} from "../../../../../uiLayers/types/select/selectExecuteHandler";
import {createAction} from "../../../../../actions/createAction";

/**
 * A simple execute handler for updating numeric fields, allowing the choice of multiple options
 */
export const numberInputSelectExecuteHandler = createAction({
    name: "number select input",
    parents: [selectExecuteHandler],
    core: (data: INumberInputSelectExecuteData[]) => ({
        children: data.map(
            ({field, liveUpdate, undoable, options, allowCustomInput, ...rest}) =>
                selectExecuteHandler.createBinding<number>({
                    field,
                    undoable,
                    options,
                    liveUpdate,
                    allowCustomInput,
                    serialize: number => number.toString(),
                    deserialize: text => Number(text),
                    checkValidity: text => checkTextNumberConstraints(text, rest),
                    createOptionView: v => createStandardMenuItem({name: v.toString()}),
                })
        ),
    }),
});
