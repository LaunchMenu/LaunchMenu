import {IFieldsTree} from "../storage/fileTypes/FieldsFile/_types/IFieldsTree";
import {IJSONDeserializer} from "./serialization/IJSONDeserializer";

/**
 * A tree of settings
 */
export type ISettingsTree<T extends IJSONDeserializer> = IFieldsTree<T>;
