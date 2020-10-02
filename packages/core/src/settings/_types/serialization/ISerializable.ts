import {IJSON} from "../../../_types/IJSON";
import {IJSONDeserializer} from "./IJSONDeserializer";

export type ISerializables<T extends IJSONDeserializer> = T extends IJSONDeserializer<
    infer I,
    infer O,
    infer N
>
    ? {serialize(): I & {$$type: N}} & O
    : unknown;

/** Serializable data, if T deserializers are specified */
export type ISerializable<T extends IJSONDeserializer = never> =
    | IJSON
    | ISerializables<T>;
