import {Field, IDataHook} from "model-react";
import Path from "path";
import FS from "fs";
import {promisify} from "util";
import {VersionedFieldsFile} from "../VersionedFieldsFile/VersionFieldsFile";
import {TFieldsTreeSerialized} from "../VersionedFieldsFile/_types/TFieldsTreeSerialized";

class Test {
    public name: string;
    public constructor(name: string) {
        this.name = name;
    }

    // Serialization stuff
    public serialize() {
        return {name: this.name};
    }
    public static deserialize(data: {name: string}): Test {
        return new Test(data.name);
    }
}
const createTestField = (value: Test) => {
    const field = new Field(value);
    return {
        get: (h: IDataHook) => field.get(h),
        set: (value: Test) => field.set(value),
        getSerialized: (h: IDataHook) => field.get(h).serialize(),
        setSerialized: ({name}: {name: string}) => field.set(Test.deserialize({name})),
    };
};

const oldFieldsVersion = {
    oranges: new Field("yes"),
    potatoes: new Field(4),
    shit: new Field({test: 3}),
    stuff: {
        potatoes: new Field(true),
    },
};
const createFieldsCustom = () => ({
    oranges: new Field("yes"),
    potatoes: new Field(4),
    shit: new Field({test: 3}),
    stuff: {
        potatoes: new Field(true),
        sub: {
            sub: {
                potatoes: createTestField(new Test("yes")),
            },
        },
    },
});

const getPath = (path: string) =>
    Path.join(process.cwd(), "data", "tests", "VersionedFieldsFile", path);

describe("FieldsFile", () => {
    describe("new VersionedFieldsFile", () => {
        it("Can be constructed with custom types", () => {
            const file = new VersionedFieldsFile({
                version: 1,
                updater: (version, data) => data as any,
                path: getPath("t0.json"),
                // fields: createFieldsCustom(),
                fields: {},
            });
        });
    });
    describe("FieldsFile.save", () => {
        it("Correctly saves data", async () => {
            const path = getPath("t1.json");
            const file = new VersionedFieldsFile({
                version: 1,
                updater: (version, data) => data as any,
                path,
                fields: createFieldsCustom(),
            });
            await file.save();
            const jsonRaw = await promisify(FS.readFile)(path, "utf8");
            const json = JSON.parse(jsonRaw);
            expect(json).toEqual({
                version: 1,
                data: {
                    oranges: "yes",
                    potatoes: 4,
                    shit: {test: 3},
                    stuff: {
                        potatoes: true,
                        sub: {
                            sub: {
                                potatoes: {
                                    name: "yes",
                                },
                            },
                        },
                    },
                },
            });
        });
    });
    describe("FieldsFile.load", () => {
        it("Correctly updates previous data versions", async () => {
            const path = getPath("t2.json");
            await promisify(FS.writeFile)(
                path,
                JSON.stringify({
                    version: 0,
                    data: {
                        oranges: "no",
                        potatoes: 41,
                        shit: {test: 32},
                        stuff: {
                            potatoes: false,
                        },
                    },
                }),
                "utf8"
            );

            const file = new VersionedFieldsFile({
                version: 1 as number,
                updater: (
                    version,
                    data: TFieldsTreeSerialized<
                        typeof createFieldsCustom extends () => infer T ? T : unknown
                    >
                ) => {
                    if (version == 0) {
                        const v0 = data as TFieldsTreeSerialized<typeof oldFieldsVersion>;
                        data = {
                            ...v0,
                            stuff: {
                                ...v0.stuff,
                                sub: {
                                    sub: {
                                        potatoes: {
                                            name: "bob",
                                        },
                                    },
                                },
                            },
                        };
                    }
                    return data;
                },
                path,
                fields: createFieldsCustom(),
            });
            await file.load();
            expect(file.fields.oranges.get(null)).toEqual("no");
            expect(file.fields.potatoes.get(null)).toEqual(41);
            expect(file.fields.shit.get(null)).toEqual({test: 32});
            expect(file.fields.stuff.potatoes.get(null)).toEqual(false);
            const t = file.fields.stuff.sub.sub.potatoes.get(null);
            expect(t.name).toEqual("bob");
            expect(t).toBeInstanceOf(Test);
        });
    });
});
