export type ITagsOverride =
    /** The new tags */
    | any[]
    /**
     * A function obtaining new tags given the old (default) tags
     * @param tags The default tags
     * @returns The new tags
     */
    | ((tags: any[]) => any[]);
