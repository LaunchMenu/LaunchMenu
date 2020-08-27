import {IField} from "../../../../_types/IField";
import {KeyPattern} from "../KeyPattern";
import {IIOContext} from "../../../../context/_types/IIOContext";

/**
 * The data that can be applied to the advanced key input executer
 */
export type IAdvancedKeyInputExecuteData = {
    /** The field to store the pattern in */
    field: IField<KeyPattern>;
    /** The context to show the field in */
    context: IIOContext;
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
