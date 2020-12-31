import {IField} from "../../../../../_types/IField";
import {IJSON} from "../../../../../_types/IJSON";
import {ISerializeField} from "./ISerializedField";

export type IFieldFileChangeListener = {
    /**
     * A callback for when a field was altered
     * @param field The field that was altered
     * @param path The path that the field can be found at
     */
    (field: ISerializeField<IJSON> | IField<IJSON>, path: string): void;
};
