import {IField} from "../../../../../_types/IField";
import {IFieldsTree} from "../../FieldsFile/_types/IFieldsTree";
import {IJSONDeserializer} from "../../../../_types/serialization/IJSONDeserializer";

export type TFieldSerialized<T> = T extends {serialize(): infer U} ? U : T;

/**
 * Extracts the serialized data of a fields tree
 */
export type TFieldsTreeSerialized<
    T extends IFieldsTree<S>,
    S extends IJSONDeserializer
> = {
    [K in keyof T]: T[K] extends IFieldsTree<S>
        ? TFieldsTreeSerialized<T[K], S>
        : T[K] extends IField<infer U>
        ? TFieldSerialized<U>
        : T[K];
};
