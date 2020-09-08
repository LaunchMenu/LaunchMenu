import {Observer} from "../Observer";
import {wait} from "../../../_tests/wait.helper";
import {Field, DataLoader} from "model-react";

describe("Observer", () => {
    describe("new Observer", () => {
        it("Properly creates an observer", () => {
            new Observer(() => 2);
            new Observer(() => 2, {debounce: 2});
            new Observer(() => 2, {refreshData: false});
            new Observer(() => 2, {init: true});
        });
        it("Doesn't call the getter", async () => {
            let called = false;
            new Observer(() => (called = true));
            await wait();
            expect(called).toBe(false);
        });
    });
    describe("Observer.listen", () => {
        it("Adds the listener", async () => {
            const field = new Field(false);
            const listener = jest.fn();
            new Observer(field).listen(listener);
            await wait(5);
            expect(listener.mock.calls.length).toBe(0);
            field.set(true);
            await wait(5);
            expect(listener.mock.calls.length).toBe(1);
        });
        it("Calls the listener if initCall is true", () => {
            const field = new Field(false);
            const listener = jest.fn();
            new Observer(field).listen(listener, true);
            expect(listener.mock.calls.length).toBe(1);
        });
    });
    describe("Observer.remove", () => {
        it("Removes the listener", async () => {
            const field = new Field(false);
            const listener = jest.fn();
            const observer = new Observer(field).listen(listener);
            await wait(5);
            expect(listener.mock.calls.length).toBe(0);
            field.set(true);
            await wait(5);
            expect(listener.mock.calls.length).toBe(1);
            observer.removeListener(listener);
            field.set(false);
            await wait(5);
            expect(listener.mock.calls.length).toBe(1);
        });
        it("Returns whether the listener was added initially", () => {
            const field = new Field(false);
            const listener = jest.fn();
            const listener2 = jest.fn();
            const observer = new Observer(field).listen(listener);
            expect(observer.removeListener(listener)).toBe(true);
            expect(observer.removeListener(listener2)).toBe(false);
        });
    });
    describe("Observer.destroy", () => {
        it("Removes all hook listeners", () => {
            let added = false;
            let removed = false;
            const observer = new Observer(h => {
                if (h && "registerRemover" in h)
                    h.registerRemover(() => (removed = true));
                added = true;
            });
            observer.listen(() => {});
            expect(added).toBe(true);
            expect(removed).toBe(false);
            observer.destroy();
            expect(removed).toBe(true);
        });
        it("Prevents adding and removing of listeners", () => {
            const field = new Field(false);
            const listener = jest.fn();
            const observer = new Observer(field);
            observer.destroy();
            expect(() => observer.listen(listener)).toThrow();
            expect(() => observer.removeListener(listener)).toThrow();
        });
    });
    describe("Retrieves the data it's observing correctly", () => {
        it("Calls listeners on data changes", async () => {
            const field = new Field(0);
            const listener = jest.fn();
            new Observer(field).listen(listener);
            await wait(5);
            expect(listener.mock.calls.length).toBe(0);

            field.set(1);
            await wait(5);
            expect(listener.mock.calls.length).toBe(1);
            expect(listener.mock.calls[0]).toEqual([
                1,
                {isLoading: false, exceptions: []},
                0,
            ]);

            field.set(5);
            await wait(5);
            expect(listener.mock.calls.length).toBe(2);
            expect(listener.mock.calls[1]).toEqual([
                5,
                {isLoading: false, exceptions: []},
                1,
            ]);
        });
        it("Considers the debounce constructor variable", async () => {
            const field = new Field(0);
            // Default debounce, 0ms
            const listener1 = jest.fn();
            new Observer(field).listen(listener1);
            expect(listener1.mock.calls.length).toBe(0);
            field.set(1);
            field.set(2);
            await wait(5);
            expect(listener1.mock.calls.length).toBe(1);
            expect(listener1.mock.calls[0]).toEqual([
                2,
                {isLoading: false, exceptions: []},
                0,
            ]);
            field.set(3);
            await wait(5);
            field.set(4);
            await wait(5);
            expect(listener1.mock.calls.length).toBe(3);
            expect(listener1.mock.calls[1]).toEqual([
                3,
                {isLoading: false, exceptions: []},
                2,
            ]);
            expect(listener1.mock.calls[2]).toEqual([
                4,
                {isLoading: false, exceptions: []},
                3,
            ]);

            // -1ms debounce (synchronous)
            const listener2 = jest.fn();
            new Observer(field, {debounce: -1}).listen(listener2);
            expect(listener2.mock.calls.length).toBe(0);
            field.set(1);
            field.set(2);
            // Note there is no await, since these calls are synchronous
            expect(listener2.mock.calls.length).toBe(2);
            expect(listener2.mock.calls[0]).toEqual([
                1,
                {isLoading: false, exceptions: []},
                4,
            ]);
            expect(listener2.mock.calls[1]).toEqual([
                2,
                {isLoading: false, exceptions: []},
                1,
            ]);

            // Default debounce, 10ms
            const listener3 = jest.fn();
            new Observer(field, {debounce: 10}).listen(listener3);
            expect(listener3.mock.calls.length).toBe(0);
            field.set(1);
            field.set(2);
            await wait(15);
            expect(listener3.mock.calls.length).toBe(1);
            expect(listener3.mock.calls[0]).toEqual([
                2,
                {isLoading: false, exceptions: []},
                2,
            ]);
            field.set(3);
            await wait(5);
            field.set(4);
            await wait(15);
            expect(listener3.mock.calls.length).toBe(2);
            expect(listener3.mock.calls[1]).toEqual([
                4,
                {isLoading: false, exceptions: []},
                2,
            ]);
        });
        it("Considers the refresh data variable", async () => {
            // Load data sources by default
            const loader1 = new DataLoader(async () => {
                await wait(10);
                return 2;
            }, 0);
            const listener1 = jest.fn();
            new Observer(loader1).listen(listener1);
            await wait(5);
            expect(listener1.mock.calls.length).toEqual(1);
            expect(listener1.mock.calls[0]).toEqual([
                0,
                {isLoading: true, exceptions: []},
                0,
            ]);
            await wait(20);
            expect(listener1.mock.calls.length).toEqual(2);
            expect(listener1.mock.calls[1]).toEqual([
                2,
                {isLoading: false, exceptions: []},
                0,
            ]);

            // Don't load data sources if specified
            const loader2 = new DataLoader(async () => {
                await wait(10);
                return 2;
            }, 0);
            const listener2 = jest.fn();
            new Observer(loader2, {debounce: 0, refreshData: false}).listen(listener2);
            expect(listener2.mock.calls.length).toEqual(0);
            await wait(20);
            expect(listener2.mock.calls.length).toEqual(0);
        });
        it("Considers the init data variable", async () => {
            let called = false;
            new Observer(() => {
                called = true;
            });
            let called2 = false;
            new Observer(
                () => {
                    called2 = true;
                },
                {init: true}
            );
            await wait();
            expect(called).toBeFalsy();
            expect(called2).toBeTruthy();
        });
        it("Correctly provides the meta data", async () => {
            // Correctly specifies the loading state
            const loader1 = new DataLoader(async () => {
                await wait(10);
                return 2;
            }, 0);
            const listener1 = jest.fn();
            new Observer(loader1).listen(listener1);
            await wait(5);
            expect(listener1.mock.calls.length).toEqual(1);
            expect(listener1.mock.calls[0]).toEqual([
                0,
                {isLoading: true, exceptions: []},
                0,
            ]);
            await wait(20);
            expect(listener1.mock.calls.length).toEqual(2);
            expect(listener1.mock.calls[1]).toEqual([
                2,
                {isLoading: false, exceptions: []},
                0,
            ]);
            loader1.markDirty();
            await wait(5);
            expect(listener1.mock.calls.length).toEqual(3);
            expect(listener1.mock.calls[2]).toEqual([
                2,
                {isLoading: true, exceptions: []},
                2,
            ]);
            await wait(20);
            expect(listener1.mock.calls.length).toEqual(4);
            expect(listener1.mock.calls[3]).toEqual([
                2,
                {isLoading: false, exceptions: []},
                2,
            ]);

            // Correctly specifies the exceptions
            const loader2 = new DataLoader(async () => {
                await wait(10);
                throw "shit";
                return 2;
            }, 0);
            const listener2 = jest.fn();
            new Observer(loader2).listen(listener2);
            await wait(5);
            expect(listener2.mock.calls.length).toEqual(1);
            expect(listener2.mock.calls[0]).toEqual([
                0,
                {isLoading: true, exceptions: []},
                0,
            ]);
            await wait(20);
            expect(listener2.mock.calls.length).toEqual(2);
            expect(listener2.mock.calls[1]).toEqual([
                0,
                {isLoading: false, exceptions: ["shit"]},
                0,
            ]);
        });
        it("Includes the previous value", async () => {
            const field = new Field(0);
            const listener = jest.fn();
            new Observer(field).listen(listener);
            await wait(5);
            expect(listener.mock.calls.length).toBe(0);

            field.set(1);
            await wait(5);
            expect(listener.mock.calls.length).toBe(1);
            expect(listener.mock.calls[0]).toEqual([
                1,
                {isLoading: false, exceptions: []},
                0,
            ]);

            field.set(5);
            await wait(5);
            expect(listener.mock.calls.length).toBe(2);
            expect(listener.mock.calls[1]).toEqual([
                5,
                {isLoading: false, exceptions: []},
                1,
            ]);
        });
    });
});
