import {IKeyId} from "@launchmenu/core";

export type IGetRepeatCount = {
    /**
     * A function that specifies how often to encounter a char before combining
     * @param id The id of the key to check
     * @returns After how many references bundling shout start (1 means every repeat is combined)
     * */
    (id: IKeyId): number;
};
