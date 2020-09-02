import {IField} from "../../_types/IField";
import {IRenderableSettingsTree} from "./IRenderableSettingsTree";
import {IJSONDeserializer} from "./serialization/IJSONDeserializer";

/**
 * Extracts a simple settings tree from a renderable settings tree, by removing the category nodes
 */
export type TSettingsTree<T extends IRenderableSettingsTree<IJSONDeserializer>> = {
    [P in keyof T]: T[P] extends {children: IRenderableSettingsTree<IJSONDeserializer>}
        ? TSettingsTree<T[P]["children"]>
        : T[P] extends IField<infer I>
        ? IField<I>
        : T[P];
};
