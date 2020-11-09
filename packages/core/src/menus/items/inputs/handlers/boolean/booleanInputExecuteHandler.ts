import {IBooleanInputExecuteData} from "./_types/IBooleanInputExecuteData";
import {createStandardMenuItem} from "../../../createStandardMenuItem";
import {selectExecuteHandler} from "../../../../../uiLayers/types/select/selectExecuteHandler";
import {createAction} from "../../../../../actions/createAction";

/**
 * A simple execute handler for updating boolean fields
 */
export const booleanInputExecuteHandler = createAction({
    name: "boolean input",
    parents: [selectExecuteHandler],
    core: (data: IBooleanInputExecuteData[]) => ({
        children: data.map(({field, liveUpdate, undoable}) =>
            selectExecuteHandler.createBinding<boolean>({
                field,
                undoable,
                liveUpdate,
                options: [true, false],
                createOptionView: v => createStandardMenuItem({name: v.toString()}),
            })
        ),
    }),
});
