import {IField} from "../../_types/IField";

/**
 * A tree of settings
 */
export type ISettingsTree = {
    [key: string]: ISettingsTree | IField<any>;
};
