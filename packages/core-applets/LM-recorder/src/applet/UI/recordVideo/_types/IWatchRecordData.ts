/** The data to provide to the watchRecordAction */
export type IWatchRecordData = {
    /** The name of the record script */
    name: string;
    /** The path to the file of the script */
    path: string;
    /** The property name of the record script */
    propName: string;
    /** The directory in which to watch for changes, defaults to the dir the file is in */
    watchDir?: string;
};
