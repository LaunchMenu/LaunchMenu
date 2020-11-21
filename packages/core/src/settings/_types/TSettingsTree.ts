import {IField} from "../../_types/IField";
import {IJSON} from "../../_types/IJSON";
import {ISerializeField} from "../storage/fileTypes/FieldsFile/_types/ISerializedField";
import {IRenderableSettingsTree} from "./IRenderableSettingsTree";

/**
 * Extracts a simple settings tree from a renderable settings tree, by removing the category nodes
 */
export type TSettingsTree<T extends IRenderableSettingsTree> = {
    [P in keyof T]: T[P] extends {children: IRenderableSettingsTree}
        ? TSettingsTree<T[P]["children"]>
        : T[P] extends IField<infer I>
        ? I extends IJSON
            ? IField<I> // Reduces the input to only a field, hiding all other data
            : TSerializableField<T[P]> & IField<I> // Reduces the input to an serialize field and a field, hiding all other data
        : TSerializableField<T[P]>; // Reduces the input to only a serialize field, hiding all other data;
};

type TSerializableField<T> = T extends ISerializeField<infer I>
    ? I extends IJSON
        ? ISerializeField<I>
        : never
    : never;
