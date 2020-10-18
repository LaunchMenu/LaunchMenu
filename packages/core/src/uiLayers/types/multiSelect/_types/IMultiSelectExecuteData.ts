import {IField} from "../../../../_types/IField";
import {IMultiSelectConfig} from "./IMultiSelectConfig";

/**
 * The data for a select input
 */
export type IMultiSelectExecuteData<T> = {
    /** The field to be altered */
    field: IField<T[]>;
} & IMultiSelectConfig<T>;
