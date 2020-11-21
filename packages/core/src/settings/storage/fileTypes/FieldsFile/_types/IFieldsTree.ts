import {IField} from "../../../../../_types/IField";
import {IJSON} from "../../../../../_types/IJSON";
import {ISerializeField} from "./ISerializedField";

/**
 * A tree of fields with a predetermined structure
 */
export type IFieldsTree = {
    [key: string]: IField<IJSON> | ISerializeField<IJSON> | IFieldsTree;
};
