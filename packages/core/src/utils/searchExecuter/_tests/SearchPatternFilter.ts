import {Observer} from "model-react";
import {wait} from "../../../_tests/wait.helper";
import {SearchPatternFilter} from "../SearchPatternFilter";
import {IPatternMatch} from "../_types/IPatternMatch";
import {createSimpleResultMap, s} from "./createSimpleResultMap.helper";

const createPatternFilter = (
    getPatternMatch?: (
        match: IPatternMatch,
        currentMatches: IPatternMatch[]
    ) => IPatternMatch | undefined
) => {
    const result = createSimpleResultMap<string>();
    return [new SearchPatternFilter({...result, getPatternMatch}), result] as const;
};

describe("SearchPatternFilter", () => {
    describe("new SearchPatternFilter", () => {
        it("Can be constructed", () => {
            new SearchPatternFilter({
                onAdd: item => {},
                onRemove: item => {},
            });
        });
    });
    describe("SearchPatternFilter.update", () => {
        describe("Adds and removes items", () => {
            it("Correctly adds new items", () => {
                const [filter, results] = createPatternFilter();
                filter.update("0", "d0");
                filter.update("1", "d1");
                filter.update("2", "d2");
                expect(results.getItems()).toEqual(s(["d0", "d1", "d2"]));
            });
            it("Correctly removes old items", () => {
                const [filter, results] = createPatternFilter();
                filter.update("0", "d0");
                filter.update("1", "d1");
                expect(results.getItems()).toEqual(s(["d0", "d1"]));
                filter.update("0", "d0new");
                filter.update("1", "d1new");
                filter.update("2", "d2");
                expect(results.getItems()).toEqual(s(["d0new", "d1new", "d2"]));
            });
            it("Doesn't remove or add undefined items", () => {
                const [filter, results] = createPatternFilter();
                filter.update("0", "d0");
                filter.update("1");
                expect(results.getItems()).toEqual(s(["d0"]));
                filter.update("0");
                filter.update("1", "d1");
                filter.update("2", "d2");
                expect(results.getItems()).toEqual(s(["d1", "d2"]));
            });
            it("Doesn't add or remove if item didn't change", async () => {
                const [filter, results] = createPatternFilter();
                filter.update("0", "d0");
                filter.update("1", "d1");
                expect(results.getItems()).toEqual(s(["d0", "d1"]));

                const listener = jest.fn();
                new Observer(h => results.getItems(h)).listen(listener);
                filter.update("1", "d1");
                expect(results.getItems()).toEqual(s(["d0", "d1"]));
                await wait(10);
                expect(listener.mock.calls.length).toBe(0);

                filter.update("1", "d1new");
                expect(results.getItems()).toEqual(s(["d0", "d1new"]));
                await wait(10);
                expect(listener.mock.calls.length).toBe(1);
            });
        });
        describe("Adds patterns", () => {
            it("Adds new patterns", () => {
                const [filter, results] = createPatternFilter();
                filter.update("0", "d0", {name: "smth"});
                filter.update("1", "d1", {name: "smthelse"});
                expect(results.getItems()).toEqual(s(["d0", "d1"]));
                expect(filter.getPatterns()).toEqual([
                    {name: "smth"},
                    {name: "smthelse"},
                ]);
            });
            it("Doesn't add duplicate patterns", () => {
                const [filter, results] = createPatternFilter();
                filter.update("0", "d0", {name: "smth"});
                filter.update("1", "d1", {name: "smth"});
                expect(results.getItems()).toEqual(s(["d0", "d1"]));
                expect(filter.getPatterns()).toEqual([{name: "smth"}]);
            });
            it("Removes any items that didn't match patterns", () => {
                const [filter, results] = createPatternFilter();
                filter.update("0", "d0");
                filter.update("1", "d1");
                expect(results.getItems()).toEqual(s(["d0", "d1"]));
                filter.update("0", "d0new", {name: "smth"});
                expect(results.getItems()).toEqual(s(["d0new"]));
                filter.update("2", "d2");
                filter.update("3", "d3", {name: "smth"});
                filter.update("4", "d4", {name: "smthelse"});
                expect(filter.getPatterns()).toEqual([
                    {name: "smth"},
                    {name: "smthelse"},
                ]);
                expect(results.getItems()).toEqual(s(["d0new", "d3", "d4"]));
            });
        });
        describe("Removes patterns", () => {
            it("Removes patterns", () => {
                const [filter, results] = createPatternFilter();
                filter.update("0", "d0", {name: "smth"});
                filter.update("1", "d1", {name: "smthelse"});
                expect(results.getItems()).toEqual(s(["d0", "d1"]));
                expect(filter.getPatterns()).toEqual([
                    {name: "smth"},
                    {name: "smthelse"},
                ]);
                filter.update("0", "d0new");
                expect(filter.getPatterns()).toEqual([{name: "smthelse"}]);
                filter.update("1", "d1new");
                expect(filter.getPatterns()).toEqual([]);
            });
            it("Doesn't remove patterns still included by other results", () => {
                const [filter, results] = createPatternFilter();
                filter.update("0", "d0", {name: "smth"});
                filter.update("1", "d1", {name: "smthelse"});
                filter.update("2", "d2", {name: "smth"});
                expect(results.getItems()).toEqual(s(["d0", "d1", "d2"]));
                expect(filter.getPatterns()).toEqual([
                    {name: "smth"},
                    {name: "smthelse"},
                ]);
                filter.update("0", "d0new");
                expect(filter.getPatterns()).toEqual([
                    {name: "smth"},
                    {name: "smthelse"},
                ]);
                filter.update("1", "d1new");
                expect(filter.getPatterns()).toEqual([{name: "smth"}]);
                filter.update("2", "d2new");
                expect(filter.getPatterns()).toEqual([]);
            });
            it("Adds items back that didn't match patterns", () => {
                const [filter, results] = createPatternFilter();
                filter.update("0", "d0", {name: "smth"});
                filter.update("1", "d1", {name: "smthelse"});
                filter.update("2", "d2", {name: "smth"});
                filter.update("3", "d3");
                expect(results.getItems()).toEqual(s(["d0", "d1", "d2"]));
                expect(filter.getPatterns()).toEqual([
                    {name: "smth"},
                    {name: "smthelse"},
                ]);

                filter.update("0", "d0new");
                expect(results.getItems()).toEqual(s(["d1", "d2"]));
                expect(filter.getPatterns()).toEqual([
                    {name: "smth"},
                    {name: "smthelse"},
                ]);

                filter.update("1", "d1");
                expect(results.getItems()).toEqual(["d2"]);
                expect(filter.getPatterns()).toEqual([{name: "smth"}]);

                filter.update("2", "d2new");
                expect(results.getItems()).toEqual(s(["d0new", "d2new", "d1", "d3"]));
                expect(filter.getPatterns()).toEqual([]);
            });
        });
    });
    describe("SearchPatternFilter.remove", () => {
        describe("Adds and removes items", () => {
            it("Properly removes the item", () => {
                const [filter, results] = createPatternFilter();
                filter.update("0", "d0");
                filter.update("1", "d1");
                filter.update("2", "d2");
                expect(results.getItems()).toEqual(s(["d0", "d1", "d2"]));
                filter.remove("2");
                expect(results.getItems()).toEqual(s(["d0", "d1"]));
                filter.remove("0");
                expect(results.getItems()).toEqual(s(["d1"]));
            });
            it("Doesn't remove undefined items", async () => {
                const [filter, results] = createPatternFilter();
                filter.update("0", "d0");
                filter.update("1", undefined);
                filter.update("2", "d2");
                expect(results.getItems()).toEqual(s(["d0", "d2"]));

                const listener = jest.fn();
                new Observer(h => results.getItems(h)).listen(listener);
                filter.remove("1");
                expect(results.getItems()).toEqual(s(["d0", "d2"]));
                await wait(10);
                expect(listener.mock.calls.length).toBe(0);

                filter.remove("2");
                expect(results.getItems()).toEqual(s(["d0"]));
                await wait(10);
                expect(listener.mock.calls.length).toBe(1);
            });
            it("Allows for correct reinsertion later", () => {
                const [filter, results] = createPatternFilter();
                filter.update("0", "d0");
                filter.update("1", "d1");
                filter.update("2", "d2");
                expect(results.getItems()).toEqual(s(["d0", "d1", "d2"]));

                filter.remove("2");
                expect(results.getItems()).toEqual(s(["d0", "d1"]));
                filter.update("2", "d2new");
                expect(results.getItems()).toEqual(s(["d0", "d1", "d2new"]));

                filter.remove("0");
                filter.update("1", "d0");
                expect(results.getItems()).toEqual(s(["d0", "d2new"]));
                filter.update("0", "d0new");
                expect(results.getItems()).toEqual(s(["d0", "d0new", "d2new"]));
            });
        });
    });
});
