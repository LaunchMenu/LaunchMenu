import {findStackChanges} from "../findStackChanges";

describe("findStackChanges", () => {
    it("Finds removals", () => {
        expect(
            findStackChanges([0, 1, 2, 3, 4, 5, 6, 7, 8, 9], [1, 2, 3, 5, 6, 9])
        ).toEqual({
            added: [],
            removed: [
                {item: 0, index: 0},
                {item: 4, index: 4},
                {item: 7, index: 7},
                {item: 8, index: 8},
            ],
        });
    });
    it("Finds additions", () => {
        expect(
            findStackChanges([1, 2, 3, 5, 6, 9], [0, 1, 2, 3, 4, 5, 6, 7, 8, 9])
        ).toEqual({
            removed: [],
            added: [
                {item: 0, index: 0},
                {item: 4, index: 4},
                {item: 7, index: 7},
                {item: 8, index: 8},
            ],
        });
    });
    it("Finds combinations of removals and additions", () => {
        expect(findStackChanges([1, 2, 3, 5, 6, 9], [0, 1, 2, 4, 5, 7, 8, 9])).toEqual({
            removed: [
                {item: 3, index: 2},
                {item: 6, index: 4},
            ],
            added: [
                {item: 0, index: 0},
                {item: 4, index: 3},
                {item: 7, index: 5},
                {item: 8, index: 6},
            ],
        });
    });
    it("Works on empty lists", () => {
        expect(findStackChanges([], [])).toEqual({
            removed: [],
            added: [],
        });

        expect(findStackChanges([], [1, 2])).toEqual({
            removed: [],
            added: [
                {item: 1, index: 0},
                {item: 2, index: 1},
            ],
        });

        expect(findStackChanges([1, 2], [])).toEqual({
            removed: [
                {item: 1, index: 0},
                {item: 2, index: 1},
            ],
            added: [],
        });
    });
    it("Marks swaps as additions and removals", () => {
        expect(findStackChanges([0, 1, 2], [0, 2, 1])).toEqual({
            removed: [{item: 2, index: 2}],
            added: [{item: 2, index: 1}],
        });
    });
});
