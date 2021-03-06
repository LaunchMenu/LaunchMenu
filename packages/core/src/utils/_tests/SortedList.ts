import {SortedList} from "../SortedList";

describe("SortedList", () => {
    describe("new SortedList", () => {
        it("Properly creates a sorted list", () => {
            const list = new SortedList({condition: (a: number, b: number) => a < b});
        });
        it("Properly initializes with the passed items", () => {
            const list = new SortedList({
                condition: (a: number, b: number) => a < b,
                items: [5, 3, 2, 4, 1],
            });
            expect(list.get()).toEqual([1, 2, 3, 4, 5]);
        });
    });
    describe("SortedList.get", () => {
        it("Retrieves the items", () => {
            const list = new SortedList({
                condition: (a: number, b: number) => a < b,
                items: [5, 3, 2, 4, 1],
            });
            expect(list.get()).toEqual([1, 2, 3, 4, 5]);
        });
        it("Can be subscribed to", () => {
            const list = new SortedList({
                condition: (a: number, b: number) => a < b,
                items: [5, 3, 2, 4, 1],
            });
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
                const list = new SortedList({
                    condition: (a: number, b: number) => a < b,
                    items: data,
                });
                const index = list.find(4);
                expect(index).toBe(3);

                const list2 = new SortedList({
                    condition: (a: number, b: number) => a > b,
                    items: data,
                });
                const index2 = list2.find(5);
                expect(index2).toBe(2);
            });
            it("Returns -1 if absent", () => {
                const list = new SortedList({
                    condition: (a: number, b: number) => a < b,
                    items: data,
                });
                const index = list.find(9);
                expect(index).toBe(-1);
            });
        });
        describe("Finds item by check callback", () => {
            const data = [{k: 5}, {k: 3}, {k: 6}, {k: 2}, {k: 7}, {k: 4}, {k: 1}];
            it("Finds the item if present", () => {
                const list = new SortedList({
                    condition: (a: {k: number}, b: {k: number}) => a.k < b.k,
                    items: data,
                });
                const l = 6;
                const item = list.find(({k}) => (l < k ? -1 : l > k ? 1 : 0));
                expect(item).toEqual({index: 5, item: {k: 6}});

                const list2 = new SortedList({
                    condition: (a: {k: number}, b: {k: number}) => a.k > b.k,
                    items: data,
                });
                const item2 = list2.find(({k}) => (l > k ? -1 : l < k ? 1 : 0));
                expect(item2).toEqual({index: 1, item: {k: 6}});
            });
            it("Returns -1 if absent", () => {
                const list = new SortedList({
                    condition: (a: {k: number}, b: {k: number}) => a.k < b.k,
                    items: data,
                });
                const l = 10;
                const item = list.find(({k}) => (l < k ? -1 : l > k ? 1 : 0));
                expect(item).toEqual({index: -1});
            });
        });
    });
    describe("SortedList.add", () => {
        let list: SortedList<number>;
        beforeEach(() => {
            list = new SortedList({
                condition: (a: number, b: number) => a < b,
                items: [2, 0, 8, 4, 6],
            });
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
        describe("Uses the max items argument", () => {
            it("Respects the max items argument", () => {
                list.add([1, 5, 3, 7, 9], 8);
                expect(list.get()).toEqual([0, 1, 2, 3, 4, 5, 6, 7]);
            });
            it("Correctly calls remove listeners", () => {
                const onRemove = jest.fn();
                list = new SortedList({
                    condition: (a: number, b: number) => a < b,
                    items: [2, 0, 8, 4, 6],
                    onRemove,
                });
                list.add([1, 5, 3, 7, 9], 6);
                expect(list.get()).toEqual([0, 1, 2, 3, 4, 5]);
                expect(onRemove.mock.calls.length).toEqual(2);
                expect(onRemove.mock.calls[0]).toEqual([6]);
                expect(onRemove.mock.calls[1]).toEqual([8]);
            });
            it("Correctly calls add listeners", () => {
                const onAdd = jest.fn();
                list = new SortedList({
                    condition: (a: number, b: number) => a < b,
                    items: [2, 0, 8, 4, 6],
                    onAdd,
                });
                list.add([1, 5, 3, 7, 9], 6);
                expect(list.get()).toEqual([0, 1, 2, 3, 4, 5]);

                expect(onAdd.mock.calls.length).toEqual(8);
                // init list
                expect(onAdd.mock.calls[0]).toEqual([0]);
                expect(onAdd.mock.calls[1]).toEqual([2]);
                expect(onAdd.mock.calls[2]).toEqual([4]);
                expect(onAdd.mock.calls[3]).toEqual([6]);
                expect(onAdd.mock.calls[4]).toEqual([8]);

                // add list
                expect(onAdd.mock.calls[5]).toEqual([1]);
                expect(onAdd.mock.calls[6]).toEqual([3]);
                expect(onAdd.mock.calls[7]).toEqual([5]);
            });
        });
        it("Handles custom comparison functions", () => {
            list = new SortedList({
                condition: (a: number, b: number) => a > b,
                items: [2, 0, 8, 4, 6],
            });
            list.add([1, 5, 3, 7, 9]);
            expect(list.get()).toEqual([9, 8, 7, 6, 5, 4, 3, 2, 1, 0]);
        });
    });
    describe("SortedList.remove", () => {
        let list: SortedList<number>;
        beforeEach(() => {
            list = new SortedList({
                condition: (a: number, b: number) => a < b,
                items: [2, 1, 0, 3, 8, 9, 4, 7, 6, 5],
            });
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
        it("Removes items correctly according to a 'equal' function", () => {
            const list = new SortedList({
                condition: (a: {v: number}, b: {v: number}) => a.v < b.v,
                items: [
                    {v: 2},
                    {v: 1},
                    {v: 0},
                    {v: 3},
                    {v: 8},
                    {v: 9},
                    {v: 4},
                    {v: 7},
                    {v: 6},
                    {v: 5},
                ],
            });
            // Note, equals still uses the sorting for efficiency, and assumes the input data has the same format
            list.remove([{v: 1}, {v: 5}, {v: 3}], (a, b) => a.v == b.v);
            list.remove({v: 7}, (a, b) => a.v == b.v);
            list.remove({v: 9}, (a, b) => a.v == b.v);
            list.remove({v: 8}); // Should be ignored, since no value is strictly equivalent
            expect(list.get()).toEqual([{v: 0}, {v: 2}, {v: 4}, {v: 6}, {v: 8}]);
        });
        it("Correctly calls remove listeners", () => {
            const onRemove = jest.fn();
            list = new SortedList({
                condition: (a: number, b: number) => a < b,
                items: [2, 0, 8, 4, 6],
                onRemove,
            });
            list.remove([8, 0]);
            expect(list.get()).toEqual([2, 4, 6]);
            expect(onRemove.mock.calls.length).toEqual(2);
            expect(onRemove.mock.calls[0]).toEqual([0]);
            expect(onRemove.mock.calls[1]).toEqual([8]);
        });
    });
    describe("SortedList.removeIndex", () => {
        let list: SortedList<number>;
        beforeEach(() => {
            list = new SortedList({
                condition: (a: number, b: number) => a < b,
                items: [2, 1, 3, 8, 9, 4, 7, 6, 5],
            });
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
        it("Correctly calls remove listeners", () => {
            const onRemove = jest.fn();
            list = new SortedList({
                condition: (a: number, b: number) => a < b,
                items: [2, 1, 3, 8, 9, 4, 7, 6, 5],
                onRemove,
            });
            list.removeIndex([1, 5, 3, 7]);
            expect(list.get()).toEqual([1, 3, 5, 7, 9]);
            expect(onRemove.mock.calls.length).toEqual(4);
            expect(onRemove.mock.calls[0]).toEqual([2]);
            expect(onRemove.mock.calls[1]).toEqual([4]);
            expect(onRemove.mock.calls[2]).toEqual([6]);
            expect(onRemove.mock.calls[3]).toEqual([8]);
        });
    });
    describe("SortedList.filter", () => {
        it("Removes all items that don't match the filter", () => {
            const list = new SortedList({
                condition: (a: number, b: number) => a < b,
                items: [2, 1, 3, 0, 8, 9, 4, 7, 6, 5],
            });
            list.filter(a => a % 2 == 0);
            expect(list.get()).toEqual([0, 2, 4, 6, 8]);
        });
        it("Correctly calls remove listeners", () => {
            const onRemove = jest.fn();
            const list = new SortedList({
                condition: (a: number, b: number) => a < b,
                items: [2, 1, 3, 0, 8, 9, 4, 7, 6, 5],
                onRemove,
            });
            list.filter(a => a % 2 == 0);
            expect(list.get()).toEqual([0, 2, 4, 6, 8]);
            expect(onRemove.mock.calls.length).toEqual(5);
            expect(onRemove.mock.calls[0]).toEqual([1]);
            expect(onRemove.mock.calls[1]).toEqual([3]);
            expect(onRemove.mock.calls[2]).toEqual([5]);
            expect(onRemove.mock.calls[3]).toEqual([7]);
            expect(onRemove.mock.calls[4]).toEqual([9]);
        });
    });
    describe("SortedList.clear", () => {
        it("Clears the list", () => {
            const list = new SortedList({
                condition: (a: number, b: number) => a < b,
                items: [2, 1, 3, 0, 8, 9, 4, 7, 6, 5],
            });
            expect(list.get()).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);
            list.clear();
            expect(list.get()).toEqual([]);
        });
    });
});
