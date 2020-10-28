import {IMenuItem} from "../../menus/items/_types/IMenuItem";
import {IField} from "../../_types/IField";
import {IJSONDeserializer} from "./serialization/IJSONDeserializer";
import {ISerializable} from "./serialization/ISerializable";

/**
 * A settings tree that can easily be rendered in a menu
 */
export type IRenderableSettingsTree<T extends IJSONDeserializer = never> = {
    [key: string]: IMenuItem &
        (IField<ISerializable<T>> | {children: IRenderableSettingsTree<T>});
};
