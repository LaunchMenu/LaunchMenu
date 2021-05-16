import {IIdentifiedItem} from "../../_types/IIdentifiedItem";
import {findStackChanges} from "../findStackChanges";

const c = (items: (number | string)[]) => items.map(p);
let cache: Record<number | string, IIdentifiedItem<number | string>> = {};
const p = (v: number | string): IIdentifiedItem<number | string> => {
    if (!cache[v]) {
        cache[v] = {
            ID: v + "",
            value: v,
        };
    }
    return cache[v];
};

describe("findStackChanges", () => {
    it("Finds removals", () => {
        expect(
            findStackChanges(c([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]), c([1, 2, 3, 5, 6, 9]))
        ).toEqual({
            added: [],
            updated: [],
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
            updated: [],
            added: [
                {item: p(0), index: 0},
                {item: p(4), index: 4},
                {item: p(7), index: 7},
                {item: p(8), index: 8},
            ],
        });
    });
    it("Finds updates", () => {
        const i1 = {ID: 1, value: 1};
        const i2 = {ID: 2, value: 2};
        const i3 = {ID: 2, value: 3};
        expect(findStackChanges([i1, i2], [i3, i1])).toEqual({
            removed: [],
            updated: [{index: 0, oldItem: i2, newItem: i3}],
            added: [],
        });
    });
    it("Finds combinations of removals and additions", () => {
        expect(
            findStackChanges(c([1, 2, 3, 5, 6, 9]), c([0, 1, 2, 4, 5, 7, 8, 9]))
        ).toEqual({
            updated: [],
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
            updated: [],
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
            updated: [],
            removed: [],
            added: [],
        });

        expect(findStackChanges([], c([1, 2]))).toEqual({
            updated: [],
            removed: [],
            added: [
                {item: p(1), index: 0},
                {item: p(2), index: 1},
            ],
        });

        expect(findStackChanges(c([1, 2]), [])).toEqual({
            updated: [],
            removed: [
                {item: p(1), index: 0},
                {item: p(2), index: 1},
            ],
            added: [],
        });
    });
    it("Does not mark swaps as additions and removals", () => {
        expect(findStackChanges(c([0, 1, 2]), c([0, 2, 1]))).toEqual({
            updated: [],
            removed: [],
            added: [],
        });
    });
});
