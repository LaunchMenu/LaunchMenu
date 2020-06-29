import {quickSort} from "../quickSort";

describe("quickSort", () => {
    it("Correctly sorts 0 items", () => {
        expect(quickSort([])).toEqual([]);
    });
    it("Correctly sorts 1 items", () => {
        expect(quickSort([1])).toEqual([1]);
    });
    it("Correctly sorts 10 items", () => {
        expect(quickSort([6, 3, 7, 8, 2, 5, 1, 9, 0, 4])).toEqual([
            0,
            1,
            2,
            3,
            4,
            5,
            6,
            7,
            8,
            9,
        ]);
    });

    it("Correctly sorts 1000 items", () => {
        const isSorted = list => {
            for (let i = 0; i < list.length - 1; i++)
                if (list[i] > list[i + 1]) return false;
            return true;
        };
        const items = new Array(1000).fill(null).map(() => Math.random());
        expect(isSorted(quickSort(items))).toBeTruthy();
    });
    it("Correctly handles a comparison condition", () => {
        expect(quickSort([6, 3, 7, 8, 2, 5, 1, 9, 0, 4], (a, b) => a > b)).toEqual([
            9,
            8,
            7,
            6,
            5,
            4,
            3,
            2,
            1,
            0,
        ]);
    });
});
