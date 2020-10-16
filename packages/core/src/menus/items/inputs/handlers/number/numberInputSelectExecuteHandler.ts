import {checkTextNumberConstraints} from "./checkTextNumberConstraints";
import {INumberInputSelectExecuteData} from "./_types/INumberInputSelectExecuteData";
import {results} from "../../../../actions/Action";
import {createStandardMenuItem} from "../../../createStandardMenuItem";
import {selectExecuteHandler} from "../../../../../uiLayers/types/select/selectExecuteHandler";
import {ISelectExecuteData} from "../../../../../uiLayers/types/select/_types/ISelectExecuteData";

/**
 * A simple execute handler for updating numeric fields, allowing the choice of multiple options
 */
export const numberInputSelectExecuteHandler = selectExecuteHandler.createHandler(
    (data: INumberInputSelectExecuteData[]) => ({
        [results]: data.map(
            ({
                field,
                liveUpdate,
                undoable,
                options,
                allowCustomInput,
                ...rest
            }): ISelectExecuteData<number, boolean> => ({
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
    })
);
