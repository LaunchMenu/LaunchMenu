import {ExportDir} from "./readExports";

export interface Config {
    /** The source directory */
    srcDir: string;
    /** The build directory */
    buildDir: string;
    /** The path relative to build dir to export the runtime data to */
    apiDir: string;
    /** The path relative to build dir to export the type definitions to */
    typesDir: string;
    /** The path to export the complete index to */
    indexPath?: string;
    /** The name of the file to specify the export location of a directory */
    exportToFileName: string;
    /** The text to represent that a the data shouldn't be exported (used in place of a path) */
    noExportText: string;
}

export type ExportMap = {[path: string]: Export[]};

export interface ExportOutputs {
    /** The runtime variable exports */
    runtime: ExportDir;
    /** The type variable exports */
    type: ExportDir;
    /** The exports per path */
    fileExports: ExportMap;
}

export type Exports = {[path: string]: string[]};

export interface Export {
    /** The path to the source export */
    path: string;
    /** The props to export */
    prop: string[];
    /** The location this export should be added to */
    target: string;
    /** Whether the exported props are types */
    isType?: boolean;
}

export interface ExportDir {
    /** The path to this directory */
    path: string;
    /** Child exports, where every child is a directory in the hierarchy */
    children: {[child: string]: ExportDir};
    /** The exports of this directory */
    exports: Exports;
}
