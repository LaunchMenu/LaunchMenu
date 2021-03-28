import {IBooleanInputExecuteData} from "./_types/IBooleanInputExecuteData";
import {createStandardMenuItem} from "../../../createStandardMenuItem";
import {promptSelectExecuteHandler} from "../../../../../uiLayers/types/select/promptSelectExecuteHandler";
import {createAction} from "../../../../../actions/createAction";

/**
 * A simple execute handler for updating boolean fields
 */
export const promptBooleanInputExecuteHandler = createAction({
    name: "boolean input",
    parents: [promptSelectExecuteHandler],
    core: (data: IBooleanInputExecuteData[]) => ({
        children: data.map(({field, liveUpdate, undoable}) =>
            promptSelectExecuteHandler.createBinding({
                field,
                undoable,
                liveUpdate,
                options: [true, false],
                createOptionView: v => createStandardMenuItem({name: v.toString()}),
            })
        ),
    }),
});
