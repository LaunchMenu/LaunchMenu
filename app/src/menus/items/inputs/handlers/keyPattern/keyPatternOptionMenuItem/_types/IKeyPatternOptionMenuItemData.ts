import {KeyPattern} from "../../KeyPattern";
import {IKeyArrayPatternData} from "../../_types/IKeyPatternData";
import {IField} from "../../../../../../../_types/IField";

/**
 * The input data for a keyPatternMenuItem
 */
export type IKeyPatternOptionMenuItemData = {
    /** The pattern to be updated */
    patternField: IField<KeyPattern>;
    /** The option that this item is for */
    option: IKeyArrayPatternData;
};
