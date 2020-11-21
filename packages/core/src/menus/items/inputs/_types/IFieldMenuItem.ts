import {ISerializableField} from "../../../../settings/_types/ISerializableField";
import {IJSON} from "../../../../_types/IJSON";
import {IMenuItem} from "../../_types/IMenuItem";

/**
 * A field menu item that can both be altered and rendered in a menu
 */
export type IFieldMenuItem<T, D extends IJSON = IJSON> = ISerializableField<T, D> &
    IMenuItem;
