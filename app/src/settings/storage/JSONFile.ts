import {File} from "./File";
import {IJSON} from "../../_types/IJSON";

/**
 * A class to store files in a json format
 */
export class JSONFile extends File<IJSON, IJSON> {
    /**
     * Creates a new json file
     * @param path The path to store the data at
     * @param load Whether to immediately load the data
     * @param init The initial data
     */
    public constructor(path: string, load: boolean = false, init: IJSON = {}) {
        super(path, load, init, "utf8");
    }

    // Data coding
    /** @override */
    protected encode(data: IJSON): any {
        return JSON.stringify(data, null, 4);
    }

    /** @override */
    protected decode(data: any): IJSON {
        return JSON.parse(data);
    }
}
