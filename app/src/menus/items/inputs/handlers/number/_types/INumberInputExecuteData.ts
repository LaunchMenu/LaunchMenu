import {INumberConstraints} from "./INumberConstraints";
import {IField} from "../../../../../../_types/IField";
import {IIOContext} from "../../../../../../context/_types/IIOContext";

/**
 * The data that can be applied to the number input executer
 */
export type INumberInputExecuteData = {
    /** The field to store the boolean in */
    field: IField<number>;
    /** Whether the field should update while editing */
    liveUpdate?: boolean;
} & INumberConstraints &
    (
        | {
              /** Whether the change action is undoable */
              undoable?: false;
          }
        | {
              /** Whether the change action is undoable */
              undoable?: true;
              /** Whether the field should update while editing */
              liveUpdate?: false;
          }
    );
