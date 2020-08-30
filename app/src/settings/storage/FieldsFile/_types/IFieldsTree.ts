import {IField} from "../../../../_types/IField";
import {IJSON} from "../../../../_types/IJSON";
import {IJSONDeserializer} from "./IJSONDeserializer";

export type TSerializables<T extends IJSONDeserializer> = T extends IJSONDeserializer<
    infer I,
    infer O,
    infer N
>
    ? {serialize(): I & {type: N}} & O
    : never;

/**
 * A tree of fields with a predetermined structure
 */
export type IFieldsTree<T extends IJSONDeserializer> = {
    [key: string]: IFieldsTree<T> | IField<IJSON | TSerializables<T>>;
};
