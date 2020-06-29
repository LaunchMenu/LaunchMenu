import {SortedList} from "../SortedList";

describe("SortedList", () => {
    describe("new SortedList", () => {
        it("Properly creates a sorted list", () => {
            const list = new SortedList((a: number, b: number) => a < b);
        });
        it("Properly initializes with the passed items", () => {
            const list = new SortedList((a: number, b: number) => a < b, [5, 3, 2, 4, 1]);
            expect(list.get()).toEqual([1, 2, 3, 4, 5]);
        });
    });
    describe("SortedLsit.get", () => {
        it("Retrieves the items", () => {
            const list = new SortedList((a: number, b: number) => a < b, [5, 3, 2, 4, 1]);
            expect(list.get()).toEqual([1, 2, 3, 4, 5]);
        });
        it("Can be subscribed to", () => {
            const list = new SortedList((a: number, b: number) => a < b, [5, 3, 2, 4, 1]);
            const callback = jest.fn(() => {});
            expect(list.get({call: callback, registerRemover: () => {}})).toEqual([
                1,
                2,
                3,
                4,
                5,
            ]);
            expect(callback.mock.calls.length).toBe(0);
            list.add(3);
            expect(callback.mock.calls.length).toBe(1);
        });
    });
    describe("SortedLsit.find", () => {
        const data = [5, 3, 6, 2, 7, 4, 1];
        describe("Finds item by reference", () => {
            it("Finds the item if present", () => {
                const list = new SortedList((a: number, b: number) => a < b, data);
                const index = list.find(4);
                expect(index).toBe(3);

                const list2 = new SortedList((a: number, b: number) => a > b, data);
                const index2 = list2.find(5);
                expect(index2).toBe(2);
            });
            it("Returns -1 if absent", () => {
                const list = new SortedList((a: number, b: number) => a < b, data);
                const index = list.find(9);
                expect(index).toBe(-1);
            });
        });
        describe("Finds item by check callback", () => {});
    });
    describe("SortedList.add", () => {
        let list: SortedList<number>;
        beforeEach(() => {
            list = new SortedList((a: number, b: number) => a < b, [2, 0, 8, 4, 6]);
        });
        it("Adds a batch of items correctly", () => {
            list.add([1, 5, 3, 7, 9]);
            expect(list.get()).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);
        });
        it("Adds one item at a time correctly", () => {
            list.add(1);
            list.add(5);
            list.add(3);
            list.add(7);
            list.add(9);
            expect(list.get()).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);
        });
        it("Respects the max items argument", () => {
            list.add([1, 5, 3, 7, 9], 8);
            expect(list.get()).toEqual([0, 1, 2, 3, 4, 5, 6, 7]);
        });
        it("Handles custom comparison functions", () => {
            list = new SortedList((a: number, b: number) => a > b, [2, 0, 8, 4, 6]);
            list.add([1, 5, 3, 7, 9]);
            expect(list.get()).toEqual([9, 8, 7, 6, 5, 4, 3, 2, 1, 0]);
        });
    });
    describe("SortedList.remove", () => {
        let list: SortedList<number>;
        beforeEach(() => {
            list = new SortedList((a: number, b: number) => a < b, [
                2,
                1,
                0,
                3,
                8,
                9,
                4,
                7,
                6,
                5,
            ]);
        });
        it("Removes a batch of items correctly", () => {
            list.remove([1, 5, 3, 7, 9]);
            expect(list.get()).toEqual([0, 2, 4, 6, 8]);
        });
        it("Removes one item at a time correctly", () => {
            list.remove(1);
            list.remove(5);
            list.remove(3);
            list.remove(7);
            list.remove(9);
            expect(list.get()).toEqual([0, 2, 4, 6, 8]);
        });
    });
    describe("SortedList.removeIndex", () => {
        let list: SortedList<number>;
        beforeEach(() => {
            list = new SortedList((a: number, b: number) => a < b, [
                2,
                1,
                3,
                8,
                9,
                4,
                7,
                6,
                5,
            ]);
        });
        it("Removes a batch of indices correctly", () => {
            list.removeIndex([1, 5, 3, 7]);
            expect(list.get()).toEqual([1, 3, 5, 7, 9]);
        });
        it("Removes one index at a time correctly", () => {
            // Note, since we remove items sequentially, their indices change
            // A reversed order is used in this test to ignore the effect
            list.removeIndex(7);
            list.removeIndex(5);
            list.removeIndex(3);
            list.removeIndex(1);
            expect(list.get()).toEqual([1, 3, 5, 7, 9]);
        });
    });
    describe("SortedList.clear", () => {
        it("Clears the list", () => {
            const list = new SortedList((a: number, b: number) => a < b, [
                2,
                1,
                3,
                0,
                8,
                9,
                4,
                7,
                6,
                5,
            ]);
            expect(list.get()).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);
            list.clear();
            expect(list.get()).toEqual([]);
        });
    });
});
