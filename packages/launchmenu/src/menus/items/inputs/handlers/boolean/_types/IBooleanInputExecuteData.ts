import {IField} from "../../../../../../_types/IField";

/**
 * The data that can be applied to the boolean input executer
 */
export type IBooleanInputExecuteData = {
    /** The field to store the boolean in */
    field: IField<boolean>;
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
