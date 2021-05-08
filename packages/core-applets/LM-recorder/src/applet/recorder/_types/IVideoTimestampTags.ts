/** The tags that a video can store */
export type IVideoTimestampTags = {
    [tag: string]: IVideoTimestampTags | number;
};
