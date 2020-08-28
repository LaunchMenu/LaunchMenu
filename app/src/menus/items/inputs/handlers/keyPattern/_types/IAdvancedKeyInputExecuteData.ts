import {KeyPattern} from "../KeyPattern";
import {IField} from "../../../../../../_types/IField";

/**
 * The data that can be applied to the advanced key input executer
 */
export type IAdvancedKeyInputExecuteData = {
    /** The field to store the pattern in */
    field: IField<KeyPattern>;
    /** Whether the field should update while editing */
    liveUpdate?: boolean;
} & (
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
