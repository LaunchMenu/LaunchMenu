import {IField} from "../../_types/IField";
import {IRenderableSettingsTree} from "./IRenderableSettingsTree";
import {IJSONDeserializer} from "./serialization/IJSONDeserializer";
import {ISerializable} from "./serialization/ISerializable";

/**
 * Extracts a simple settings tree from a renderable settings tree, by removing the category nodes
 */
export type TSettingsTree<
    T extends IRenderableSettingsTree<D>,
    D extends IJSONDeserializer
> = {
    [P in keyof T]: T[P] extends {children: IRenderableSettingsTree<D>}
        ? TSettingsTree<T[P]["children"], D>
        : T[P] extends IField<infer I>
        ? I extends ISerializable<D>
            ? IField<I> // Reduces the input to only a field, hiding all other data
            : IField<ISerializable<D>>
        : IField<ISerializable<D>>; // This case shouldn't occur, is just a safety net
};
