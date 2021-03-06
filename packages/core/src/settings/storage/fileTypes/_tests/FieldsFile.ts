import {Field, IDataHook} from "model-react";
import {FieldsFile} from "../FieldsFile/FieldsFile";
import Path from "path";
import FS from "fs";
import {promisify} from "util";

const createFields = () => ({
    oranges: new Field("yes"),
    potatoes: new Field(4),
    shit: new Field({test: 3}),
    stuff: {
        potatoes: new Field(true),
        sub: {
            sub: {
                potatoes: new Field(false),
            },
        },
    },
});

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
        get: (h?: IDataHook) => field.get(h),
        set: (value: Test) => field.set(value),
        getSerialized: (h: IDataHook) => field.get(h).serialize(),
        setSerialized: ({name}: {name: string}) => field.set(Test.deserialize({name})),
    };
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
    Path.join(process.cwd(), "data", "tests", "FieldsFile", path);

describe("FieldsFile", () => {
    describe("new FieldsFile", () => {
        it("Can be constructed without custom types", () => {
            const file = new FieldsFile({
                path: getPath("t0.json"),
                fields: createFields(),
            });
        });
        it("Can be constructed with custom types", () => {
            const file = new FieldsFile({
                path: getPath("t0.json"),
                fields: createFieldsCustom(),
            });
        });
        it("Forwards the fields data", () => {
            const file = new FieldsFile({
                path: getPath("t0.json"),
                fields: createFields(),
            });
            expect(file.fields.potatoes.get()).toEqual(4);
        });
    });
    describe("FieldsFile.save", () => {
        it("Correctly saves JSON data", async () => {
            const path = getPath("t1.json");
            const file = new FieldsFile({
                path,
                fields: createFields(),
            });
            await file.save();
            const jsonRaw = await promisify(FS.readFile)(path, "utf8");
            const json = JSON.parse(jsonRaw);
            expect(json).toEqual({
                oranges: "yes",
                potatoes: 4,
                shit: {test: 3},
                stuff: {
                    potatoes: true,
                    sub: {
                        sub: {
                            potatoes: false,
                        },
                    },
                },
            });
        });
        it("Correctly saves custom data", async () => {
            const path = getPath("t2.json");
            const file = new FieldsFile({
                path,
                fields: createFieldsCustom(),
            });
            await file.save();
            const jsonRaw = await promisify(FS.readFile)(path, "utf8");
            const json = JSON.parse(jsonRaw);
            expect(json).toEqual({
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
            });
        });
    });
    describe("FieldsFile.load", () => {
        it("Correctly loads JSON data", async () => {
            const path = getPath("t3.json");
            await promisify(FS.writeFile)(
                path,
                JSON.stringify({
                    oranges: "no",
                    potatoes: 41,
                    shit: {test: 32},
                    stuff: {
                        potatoes: false,
                        sub: {
                            sub: {
                                potatoes: true,
                            },
                        },
                    },
                }),
                "utf8"
            );
            const file = new FieldsFile({
                path,
                fields: createFields(),
            });
            await file.load();
            expect(file.fields.oranges.get()).toEqual("no");
            expect(file.fields.potatoes.get()).toEqual(41);
            expect(file.fields.shit.get()).toEqual({test: 32});
            expect(file.fields.stuff.potatoes.get()).toEqual(false);
            expect(file.fields.stuff.sub.sub.potatoes.get()).toEqual(true);
        });
        it("Correctly loads custom data", async () => {
            const path = getPath("t4.json");
            await promisify(FS.writeFile)(
                path,
                JSON.stringify({
                    oranges: "no",
                    potatoes: 41,
                    shit: {test: 32},
                    stuff: {
                        potatoes: false,
                        sub: {
                            sub: {
                                potatoes: {
                                    name: "orange",
                                },
                            },
                        },
                    },
                }),
                "utf8"
            );
            const file = new FieldsFile({
                path,
                fields: createFieldsCustom(),
            });
            await file.load();
            expect(file.fields.oranges.get()).toEqual("no");
            expect(file.fields.potatoes.get()).toEqual(41);
            expect(file.fields.shit.get()).toEqual({test: 32});
            expect(file.fields.stuff.potatoes.get()).toEqual(false);
            const t = file.fields.stuff.sub.sub.potatoes.get();
            expect(t.name).toEqual("orange");
            expect(t).toBeInstanceOf(Test);
        });
    });
});
