/** The result of reviewing the audio */
export type IReviewResult = {
    /** Whether to redo the audio recording */
    rerecord?: boolean;
    /** Whether to continue to the save prompt */
    save?: boolean;
};
