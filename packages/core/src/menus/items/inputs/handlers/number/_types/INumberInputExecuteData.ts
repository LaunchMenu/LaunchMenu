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
    /** Whether the change action is undoable, not combinable with live update*/
    undoable?: boolean;
} & INumberConstraints;
