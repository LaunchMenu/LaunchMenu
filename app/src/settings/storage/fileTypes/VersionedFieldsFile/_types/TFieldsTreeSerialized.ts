import {IField} from "../../../../../_types/IField";
import {IFieldsTree} from "../../FieldsFile/_types/IFieldsTree";
export type TFieldSerialized<T> = T extends {serialize(): infer U} ? U : T;

/**
 * Extracts the serialized data of a fields tree
 */
export type TFieldsTreeSerialized<T extends IFieldsTree<any>> = {
    [K in keyof T]: T[K] extends IFieldsTree<any>
        ? TFieldsTreeSerialized<T[K]>
        : T[K] extends IField<infer U>
        ? TFieldSerialized<U>
        : T[K];
};
