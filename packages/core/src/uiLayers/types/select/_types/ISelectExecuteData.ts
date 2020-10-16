import {IField} from "../../../../_types/IField";
import {ISelectConfig} from "./ISelectConfig";

/**
 * The data for a select input
 */
export type ISelectExecuteData<T, C extends Boolean = false> = {
    /** The field to be altered */
    field: IField<T>;
} & ISelectConfig<T, C>;
