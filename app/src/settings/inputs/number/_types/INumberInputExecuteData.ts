import {IField} from "../../../../_types/IField";
import {IIOContext} from "../../../../context/_types/IIOContext";
import {INumberConstraints} from "./INumberConstraints";

/**
 * The data that can be applied to the number input executer
 */
export type INumberInputExecuteData = {
    /** The field to store the boolean in */
    field: IField<number>;
    /** The context to show the field in */
    context: IIOContext;
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
