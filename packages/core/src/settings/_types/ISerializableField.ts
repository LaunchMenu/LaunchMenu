import {IField} from "../../_types/IField";
import {IJSON} from "../../_types/IJSON";
import {ISerializeField} from "../storage/fileTypes/FieldsFile/_types/ISerializedField";

/**
 * A field whose contents can always be serialized
 */
export type ISerializableField<T, D extends IJSON> = 
// See: https://github.com/microsoft/TypeScript/issues/33110#issuecomment-525613738
// Without this fix, types such as booleans are split, resulting in the union of singleton setters (which have no overlap)
[T] extends [IJSON]
    ? IField<T>
    : IField<T> & ISerializeField<D>;
