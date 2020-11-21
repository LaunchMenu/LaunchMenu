import {IMenuItem} from "../../menus/items/_types/IMenuItem";
import {IField} from "../../_types/IField";
import {IJSON} from "../../_types/IJSON";
import {ISerializeField} from "../storage/fileTypes/FieldsFile/_types/ISerializedField";

/**
 * A settings tree that can easily be rendered in a menu
 */
export type IRenderableSettingsTree = {
    [key: string]: IMenuItem &
        (IField<IJSON> | ISerializeField<IJSON> | {children: IRenderableSettingsTree});
};
