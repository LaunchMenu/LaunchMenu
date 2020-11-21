import {IField} from "../../../../../_types/IField";
import {IFieldsTree} from "../../FieldsFile/_types/IFieldsTree";
import {ISerializeField} from "../../FieldsFile/_types/ISerializedField";

/**
 * Extracts the serialized data of a fields tree
 */
export type TFieldsTreeSerialized<T extends IFieldsTree> = {
    [K in keyof T]: T[K] extends IFieldsTree
        ? TFieldsTreeSerialized<T[K]>
        : T[K] extends ISerializeField<infer U>
        ? U
        : T[K] extends IField<infer U>
        ? U
        : T[K];
};
