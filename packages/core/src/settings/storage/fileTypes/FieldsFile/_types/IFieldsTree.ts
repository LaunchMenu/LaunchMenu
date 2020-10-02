import {IField} from "../../../../../_types/IField";
import {IJSON} from "../../../../../_types/IJSON";
import {IJSONDeserializer} from "../../../../_types/serialization/IJSONDeserializer";
import {ISerializables} from "../../../../_types/serialization/ISerializable";

/**
 * A tree of fields with a predetermined structure
 */
export type IFieldsTree<T extends IJSONDeserializer> = {
    [key: string]: IFieldsTree<T> | IField<IJSON | ISerializables<T>>;
};
