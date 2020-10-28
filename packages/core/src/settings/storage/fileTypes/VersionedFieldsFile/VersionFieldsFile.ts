import {IJSON} from "../../../../_types/IJSON";
import {FieldsFile} from "../FieldsFile/FieldsFile";
import {IFieldsTree} from "../FieldsFile/_types/IFieldsTree";
import {IJSONDeserializer} from "../../../_types/serialization/IJSONDeserializer";

export class VersionedFieldsFile<
    F extends IFieldsTree<T>,
    T extends IJSONDeserializer = never,
    V extends IJSON = string
> extends FieldsFile<F, T> {
    protected version: V;
    protected updater: (version: V, data: IJSON) => IJSON;

    /**
     * Creates a new fields file object, without custom field types
     * @param data The data to construct the fields file from
     */
    public constructor(data: {
        /** The version of the fields */
        version: V;
        /** A function that updates from previous versions of the data to the latest version */
        updater: (version: V, data: IJSON) => IJSON;
        /** The path of the file */
        path: string;
        /** The fields without any custom types */
        fields: F;
        /** No deserializers */
        deserializers?: undefined;
    });

    /**
     * Creates a new fields file object with custom field types
     * @param data The data to construct the fields file from
     */
    public constructor(data: {
        /** The version of the fields */
        version: V;
        /** A function that updates from previous versions of the data to the latest version */
        updater: (version: V, data: IJSON) => IJSON;
        /** The path of the file */
        path: string;
        /** The custom types for that can be used for deserialization */
        deserializers: T[];
        /** The fields with possible custom types */
        fields: F;
    });
    public constructor(data: {
        version: any;
        updater: (version: V, data: IJSON) => IJSON;
        path: string;
        deserializers?: T[];
        fields: F;
    }) {
        super(data as any);
        this.version = data.version;
        this.updater = data.updater;
    }

    /** @override */
    protected getData(): IJSON {
        return {
            version: this.version,
            data: this.encode(this.fields),
        };
    }

    /** @override */
    protected setData(data: {version: V; data: IJSON}): void {
        this.decode(this.updater(data.version, data.data) as any, this.fields);
    }
}
