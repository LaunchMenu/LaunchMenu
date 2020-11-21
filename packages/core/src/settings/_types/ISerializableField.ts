import {IField} from "../../_types/IField";
import {IJSON} from "../../_types/IJSON";
import {ISerializeField} from "../storage/fileTypes/FieldsFile/_types/ISerializedField";

/**
 * A field whose contents can always be serialized
 */
export type ISerializableField<T, D extends IJSON> = T extends IJSON
    ? IField<T>
    : IField<T> & ISerializeField<D>;
