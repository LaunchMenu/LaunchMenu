import {Field} from "model-react";
import {FieldsFile} from "../FieldsFile/FieldsFile";
import Path from "path";
import FS from "fs";
import {promisify} from "util";
import {JSONFile} from "../JSONFile";

const getPath = (path: string) =>
    Path.join(process.cwd(), "data", "tests", "JSONFile", path);

describe("JSONFile", () => {
    describe("new JSONFile", () => {
        it("Can be constructed", () => {
            const file = new JSONFile(getPath("t0.json"));
        });
    });
    describe("JSONFile.save", () => {
        it("Correctly saves JSON data", async () => {
            const path = getPath("t1.json");
            const file = new JSONFile(getPath("t1.json"));
            file.set({hoi: 3});
            await file.save();
            const jsonRaw = await promisify(FS.readFile)(path, "utf8");
            const json = JSON.parse(jsonRaw);
            expect(json).toEqual({
                hoi: 3,
            });
        });
    });
    describe("FieldsFile.load", () => {
        it("Correctly loads JSON data", async () => {
            const path = getPath("t2.json");
            const data = {
                oranges: "no",
                potatoes: 41,
                shit: {test: 32},
                oof: [3],
            };
            await promisify(FS.writeFile)(path, JSON.stringify(data), "utf8");
            const file = new JSONFile(getPath("t2.json"));
            await file.load();
            expect(file.get()).toEqual(data);
        });
    });
});
