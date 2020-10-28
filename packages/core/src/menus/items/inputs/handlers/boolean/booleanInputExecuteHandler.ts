import {IBooleanInputExecuteData} from "./_types/IBooleanInputExecuteData";
import {createStandardMenuItem} from "../../../createStandardMenuItem";
import {results} from "../../../../actions/Action";
import {selectExecuteHandler} from "../../../../../uiLayers/types/select/selectExecuteHandler";
import {ISelectExecuteData} from "../../../../../uiLayers/types/select/_types/ISelectExecuteData";

/**
 * A simple execute handler for updating boolean fields
 */
export const booleanInputExecuteHandler = selectExecuteHandler.createHandler(
    (data: IBooleanInputExecuteData[]) => ({
        [results]: data.map(
            ({field, liveUpdate, undoable}): ISelectExecuteData<boolean> => ({
                field,
                undoable,
                liveUpdate,
                options: [true, false],
                createOptionView: v => createStandardMenuItem({name: v.toString()}),
            })
        ),
    })
);
