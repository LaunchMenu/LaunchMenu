import {getKeyPatternOptionIndex} from "../getKeyPatternOptionIndex";
import {KeyPattern} from "../../../../../../../keyHandler/KeyPattern";
import {IDeleteKeyPatternOptionData} from "../_types/IDeleteKeyPatternOptionData";
import {SetFieldCommand} from "../../../../../../../undoRedo/commands/SetFieldCommand";
import {createAction} from "../../../../../../../actions/createAction";
import {deleteAction} from "../../../../../../../actions/types/delete/deleteAction";

/**
 * A delete handler that can be used to delete a key pattern option
 */
export const deleteKeyPatternOptionHandler = createAction({
    name: "Delete key pattern option",
    parents: [deleteAction],
    core: (data: IDeleteKeyPatternOptionData[]) => ({
        children: data.map(({option, patternField, undoable}) =>
            deleteAction.createBinding(() => {
                const pattern = patternField.get();
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
            })
        ),
    }),
});
