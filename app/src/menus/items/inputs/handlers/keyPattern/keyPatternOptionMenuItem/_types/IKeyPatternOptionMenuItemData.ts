import {KeyPattern} from "../../KeyPattern";
import {IIOContext} from "../../../../../context/_types/IIOContext";
import {IField} from "../../../../../_types/IField";
import {IKeyArrayPatternData} from "../../_types/IKeyPatternData";

/**
 * The input data for a keyPatternMenuItem
 */
export type IKeyPatternOptionMenuItemData = {
    /** The pattern to be updated */
    patternField: IField<KeyPattern>;
    /** The option that this item is for */
    option: IKeyArrayPatternData;
    /** The context to open UI in */
    context: IIOContext;
};
