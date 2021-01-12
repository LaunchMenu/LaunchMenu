import {Observer} from "model-react";
import {wait} from "../../../_tests/wait.helper";
import {Semaphore} from "../Semaphore";

describe("Semaphore", () => {
    describe("new Semaphore", () => {
        it("Can be created", () => {
            new Semaphore(3);
        });
    });
    describe("Semaphore.acquire", () => {
        let semaphore: Semaphore;
        beforeEach(() => {
            semaphore = new Semaphore(2);
        });
        it("Can be used to acquire the semaphore if concurrency isn't reached yet", async () => {
            let acquired1 = false;
            semaphore.acquire().then(() => {
                acquired1 = true;
            });
            let acquired2 = false;
            semaphore.acquire().then(() => {
                acquired2 = true;
            });
            await wait(20);
            expect(acquired1 && acquired2).toBeTruthy();
        });
        it("Can not be used to acquire the semaphore if concurrency is reached", async () => {
            let acquired1 = false;
            semaphore.acquire().then(() => {
                acquired1 = true;
            });
            let acquired2 = false;
            semaphore.acquire().then(() => {
                acquired2 = true;
            });
            let acquired3 = false;
            semaphore.acquire().then(() => {
                acquired3 = true;
            });
            await wait(20);
            expect(acquired1 && acquired2).toBeTruthy();
            expect(acquired3).toBeFalsy();
        });
        it("Returns the correct availability and release function", async () => {
            semaphore.acquire();
            const [conc, release] = await semaphore.acquire();
            expect(conc).toBe(1);
            expect(release).toBeInstanceOf(Function);
        });
        it("Can be used to acquire the semaphore when it gets released", async () => {
            semaphore.acquire();
            const [, release2] = await semaphore.acquire();
            let acquired3 = false;
            semaphore.acquire().then(() => {
                acquired3 = true;
            });
            await wait(20);
            expect(acquired3).toBeFalsy();
            release2();
            await wait(20);
            expect(acquired3).toBeTruthy();
        });
    });
    describe("Semaphore.release", () => {
        it("Isn't allowed on high concurrency semaphores", () => {
            const semaphore = new Semaphore(2);
            semaphore.acquire();
            expect(() => semaphore.release()).toThrow();
        });
        it("Can be used to release boolean semaphores", async () => {
            const semaphore = new Semaphore(1);
            semaphore.acquire();
            let acquired2 = false;
            semaphore.acquire().then(() => {
                acquired2 = true;
            });

            await wait(20);
            expect(acquired2).toBeFalsy();
            semaphore.release();
            await wait(20);
            expect(acquired2).toBeTruthy();
        });
    });
    describe("Semaphore.isLocked", () => {
        let semaphore: Semaphore;
        beforeEach(() => {
            semaphore = new Semaphore(2);
        });
        it("Correctly tracks whether the semaphore is locked", async () => {
            semaphore.acquire();
            const [, release2] = await semaphore.acquire();
            expect(semaphore.isLocked()).toBe(true);
            release2();
            await wait(20);
            expect(semaphore.isLocked()).toBe(false);
        });
        it("Can be subscribed to", async () => {
            const callback = jest.fn();
            new Observer(h => semaphore.isLocked(h)).listen(callback);

            const [, release] = await semaphore.acquire();
            expect(semaphore.isLocked()).toBe(false);

            await wait(20);
            const [, release2] = await semaphore.acquire();
            expect(semaphore.isLocked()).toBe(true);

            await wait(20);
            release();
            expect(semaphore.isLocked()).toBe(false);

            await wait(20);
            release2();
            await wait(20);

            expect(callback.mock.calls.length).toBe(4);
            expect(callback.mock.calls[0][0]).toBe(false);
            expect(callback.mock.calls[1][0]).toBe(true);
            expect(callback.mock.calls[2][0]).toBe(false);
            expect(callback.mock.calls[3][0]).toBe(false);
        });
    });
    describe("Semaphore.runExclusive", () => {
        it("Only allows the specified number of processes to run", async () => {
            const semaphore = new Semaphore(2);
            let acquired = false;
            let acquired2 = false;
            let acquired3 = false;
            semaphore.runExclusive(async () => {
                acquired = true;
                await wait(20);
            });
            semaphore.runExclusive(async () => {
                acquired2 = true;
                await wait(20);
            });
            semaphore.runExclusive(async () => {
                acquired3 = true;
                await wait(20);
            });
            await wait(10);
            expect(acquired && acquired2).toBe(true);
            expect(acquired3).toBe(false);
            await wait(30);
            expect(acquired3).toBe(true);
        });
    });
});
