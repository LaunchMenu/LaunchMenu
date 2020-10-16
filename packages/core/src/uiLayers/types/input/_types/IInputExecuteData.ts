import {IField} from "../../../../_types/IField";
import {IInputConfig} from "./IInputConfig";

/**
 * The data for a field setter
 */
export type IInputExecuteData<T> = {
    /** The field to be altered */
    field: IField<T>;
} & IInputConfig<T>;
