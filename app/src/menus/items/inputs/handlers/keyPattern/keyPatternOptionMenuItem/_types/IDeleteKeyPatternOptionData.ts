import {IField} from "../../../../../_types/IField";
import {KeyPattern} from "../../KeyPattern";
import {IKeyArrayPatternData} from "../../_types/IKeyPatternData";

export type IDeleteKeyPatternOptionData = {
    /** The pattern to be updated */
    patternField: IField<KeyPattern>;
    /** The option that this item is for */
    option: IKeyArrayPatternData;
    /** Whether the deletion should be undoable */
    undoable?: boolean;
};
