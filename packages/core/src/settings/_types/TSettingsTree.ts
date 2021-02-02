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
        : TIsField<T[P]> & Omit<T[P], "view" | "actionBindings">;
};

// Indicate that this indeed is a proper field to TS
type TIsField<T> = T extends IField<infer I>
    ? I extends IJSON
        ? unknown
        : T extends ISerializeField<infer K>
        ? K extends IJSON
            ? unknown
            : never
        : never
    : never;
