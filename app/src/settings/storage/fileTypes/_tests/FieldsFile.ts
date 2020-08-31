import {Field} from "model-react";
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
        return {
            $$type: Test.jsonTypeName,
            name: this.name,
        } as const;
    }
    public static readonly jsonTypeName = "Test";
    public static deserialize(data: {name: string}): Test {
        return new Test(data.name);
    }
}
const createFieldsCustom = () => ({
    oranges: new Field("yes"),
    potatoes: new Field(4),
    shit: new Field({test: 3}),
    stuff: {
        potatoes: new Field(true),
        sub: {
            sub: {
                potatoes: new Field(new Test("yes")),
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
                deserializers: [Test],
                fields: createFieldsCustom(),
            });
        });
        it("Forwards the fields data", () => {
            const file = new FieldsFile({
                path: getPath("t0.json"),
                fields: createFields(),
            });
            expect(file.fields.potatoes.get(null)).toEqual(4);
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
                deserializers: [Test],
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
                                $$type: "Test",
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
            expect(file.fields.oranges.get(null)).toEqual("no");
            expect(file.fields.potatoes.get(null)).toEqual(41);
            expect(file.fields.shit.get(null)).toEqual({test: 32});
            expect(file.fields.stuff.potatoes.get(null)).toEqual(false);
            expect(file.fields.stuff.sub.sub.potatoes.get(null)).toEqual(true);
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
                                    $$type: "Test",
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
                deserializers: [Test],
                fields: createFieldsCustom(),
            });
            await file.load();
            expect(file.fields.oranges.get(null)).toEqual("no");
            expect(file.fields.potatoes.get(null)).toEqual(41);
            expect(file.fields.shit.get(null)).toEqual({test: 32});
            expect(file.fields.stuff.potatoes.get(null)).toEqual(false);
            const t = file.fields.stuff.sub.sub.potatoes.get(null);
            expect(t.name).toEqual("orange");
            expect(t).toBeInstanceOf(Test);
        });
    });
});

// const file = new FieldsFile({path: "hoi", deserializers: [Test], fields: {
//     oranges: new Field("yes"),
//     potatoes: new Field(4),
//     shit: new Field({test: 3}),
//     stuff: {
//         potatoes: new Field(true),
//         sub: {
//             sub: {
//                 potatoes: new Field(new Test("yes")),
//             },
//         },
//     },
// }});
// file.fields.shit.set({test: 25});
// await file.save();

// file.fields.shit.set({test: 20});

// await file.load();
// file.fields.shit.get(null); // {test: 25}
