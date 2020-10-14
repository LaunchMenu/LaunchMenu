import {IIdentifiedItem} from "../../_types/IIdentifiedItem";
import {findStackChanges} from "../findStackChanges";

const c = (items: (number | string)[]) => items.map(p);
const p = (v: number | string): IIdentifiedItem<number | string> => ({
    ID: v + "",
    value: v,
});
describe("findStackChanges", () => {
    it("Finds removals", () => {
        expect(
            findStackChanges(c([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]), c([1, 2, 3, 5, 6, 9]))
        ).toEqual({
            added: [],
            removed: [
                {item: p(0), index: 0},
                {item: p(4), index: 4},
                {item: p(7), index: 7},
                {item: p(8), index: 8},
            ],
        });
    });
    it("Finds additions", () => {
        expect(
            findStackChanges(c([1, 2, 3, 5, 6, 9]), c([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]))
        ).toEqual({
            removed: [],
            added: [
                {item: p(0), index: 0},
                {item: p(4), index: 4},
                {item: p(7), index: 7},
                {item: p(8), index: 8},
            ],
        });
    });
    it("Finds combinations of removals and additions", () => {
        expect(
            findStackChanges(c([1, 2, 3, 5, 6, 9]), c([0, 1, 2, 4, 5, 7, 8, 9]))
        ).toEqual({
            removed: [
                {item: p(3), index: 2},
                {item: p(6), index: 4},
            ],
            added: [
                {item: p(0), index: 0},
                {item: p(4), index: 3},
                {item: p(7), index: 5},
                {item: p(8), index: 6},
            ],
        });
    });
    it("Lists changes in index order", () => {
        // Duplicate test is only here to specify that index order is part of the spec
        expect(
            findStackChanges(c([1, 2, 3, 5, 6, 9]), c([0, 1, 2, 4, 5, 7, 8, 9]))
        ).toEqual({
            removed: [
                {item: p(3), index: 2},
                {item: p(6), index: 4},
            ],
            added: [
                {item: p(0), index: 0},
                {item: p(4), index: 3},
                {item: p(7), index: 5},
                {item: p(8), index: 6},
            ],
        });
    });
    it("Works on empty lists", () => {
        expect(findStackChanges([], [])).toEqual({
            removed: [],
            added: [],
        });

        expect(findStackChanges([], c([1, 2]))).toEqual({
            removed: [],
            added: [
                {item: p(1), index: 0},
                {item: p(2), index: 1},
            ],
        });

        expect(findStackChanges(c([1, 2]), [])).toEqual({
            removed: [
                {item: p(1), index: 0},
                {item: p(2), index: 1},
            ],
            added: [],
        });
    });
    it("Marks swaps as additions and removals", () => {
        expect(findStackChanges(c([0, 1, 2]), c([0, 2, 1]))).toEqual({
            removed: [],
            added: [],
        });
    });
});
