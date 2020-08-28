import {IBooleanInputExecuteData} from "./_types/IBooleanInputExecuteData";
import {createStandardMenuItem} from "../../../createStandardMenuItem";
import {results} from "../../../../actions/Action";
import {selectFieldExecuteHandler} from "../../../../../textFields/types/selectField/selectFieldExecuteHandler";
import {ISelectFieldExecuteData} from "../../../../../textFields/types/selectField/_types/ISelectFieldExecuteData";
import {IActionMultiResult} from "../../../../actions/_types/IActionMultiResult";

/**
 * A simple execute handler for updating boolean fields
 */
export const booleanInputExecuteHandler = selectFieldExecuteHandler.createHandler(
    (data: IBooleanInputExecuteData[]) => ({
        [results]: data.map(
            ({field, liveUpdate, undoable}): ISelectFieldExecuteData<boolean> => ({
                field,
                undoable: undoable as any, // Cast to ignore relation between liveUpdate and undoable
                config: {
                    liveUpdate,
                    options: [true, false],
                    createOptionView: v => createStandardMenuItem({name: v.toString()}),
                },
            })
        ),
    })
);
