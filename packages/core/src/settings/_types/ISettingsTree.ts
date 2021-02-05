import {IField} from "../../_types/IField";
import {IJSON} from "../../_types/IJSON";
import {IFieldsTree} from "../storage/fileTypes/FieldsFile/_types/IFieldsTree";
import {ISerializeField} from "../storage/fileTypes/FieldsFile/_types/ISerializedField";
import {ISettingConfigurer} from "./ISettingConfigurer";

/**
 * A tree of settings
 */
export type ISettingsTree = {
    [key: string]:
        | ((IField<IJSON> | ISerializeField<IJSON>) & ISettingConfigurer)
        | IFieldsTree;
};
