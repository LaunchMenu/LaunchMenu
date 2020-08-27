import {results} from "../../../../../menus/actions/Action";
import {getKeyPatternOptionIndex} from "../getKeyPatternOptionIndex";
import {KeyPattern} from "../../KeyPattern";
import {SetFieldCommand} from "../../../../../undoRedo/commands/SetFieldCommand";
import {deleteAction} from "../../../../../menus/actions/types/delete/deleteAction";
import {IDeleteKeyPatternOptionData} from "../_types/IDeleteKeyPatternOptionData";

/**
 * A delete handler that can be used to delete a key pattern option
 */
export const deleteKeyPatternOptionHandler = deleteAction.createHandler(
    (data: IDeleteKeyPatternOptionData[]) => ({
        [results]: data.map(({option, patternField, undoable}) => ({
            execute: () => {
                const pattern = patternField.get(null);
                const newIndex = getKeyPatternOptionIndex(pattern, option);

                if (newIndex != -1) {
                    const newPatternData = pattern.patterns.filter(
                        (v, i) => i != newIndex
                    );

                    const newPattern = new KeyPattern(newPatternData);
                    if (undoable) {
                        return new SetFieldCommand(patternField, newPattern);
                    } else {
                        patternField.set(newPattern);
                    }
                }
            },
        })),
    })
);
