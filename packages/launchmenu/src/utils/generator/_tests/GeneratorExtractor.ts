import {GeneratorExtractor} from "../GeneratorExtractor";
import {wait} from "../../../_tests/wait.helper";

describe("GeneratorExtractor", () => {
    describe("new GeneratorExtractor", () => {
        it("Properly creates an extractor", () => {
            new GeneratorExtractor(async cb => {});
        });
    });
    describe("GeneratorExtractor.next", () => {
        let generator: GeneratorExtractor<number>;
        beforeEach(() => {
            generator = new GeneratorExtractor(async cb => {
                for (let i = 0; i < 5; i++) {
                    await cb(i);
                }
            });
        });

        it("Retrieves the next item from the generator", async () => {
            expect(await generator.next()).toEqual(0);
            expect(await generator.next()).toEqual(1);
            expect(await generator.next()).toEqual(2);
            expect(await generator.next()).toEqual(3);
            expect(await generator.next()).toEqual(4);
        });
        it("Retrieves undefined when all items are returned", async () => {
            expect(await generator.next()).toEqual(0);
            expect(await generator.next()).toEqual(1);
            expect(await generator.next()).toEqual(2);
            expect(await generator.next()).toEqual(3);
            expect(await generator.next()).toEqual(4);
            expect(await generator.next()).toEqual(undefined);
        });
        it("Indicates finished is true after the last item was retrieved", async () => {
            expect(await generator.next()).toEqual(0);
            expect(await generator.next()).toEqual(1);
            expect(await generator.next()).toEqual(2);
            expect(await generator.next()).toEqual(3);
            expect(generator.hasFinished()).toBeFalsy();
            expect(await generator.next()).toEqual(4);
            expect(generator.hasFinished()).toBeFalsy();
            expect(await generator.next()).toEqual(undefined);
            expect(generator.hasFinished()).toBeTruthy();
        });
    });

    describe("GeneratorExtractor.stop", () => {
        it("Prevents new items from being retrieved", async () => {
            const generator = new GeneratorExtractor(async cb => {
                for (let i = 0; i < 5; i++) {
                    await cb(i);
                }
            });
            expect(await generator.next()).toEqual(0);
            expect(await generator.next()).toEqual(1);
            expect(generator.hasFinished()).toBeFalsy();
            generator.stop();
            expect(generator.hasFinished()).toBeTruthy();
            expect(await generator.next()).toEqual(undefined);
            expect(await generator.next()).toEqual(undefined);
        });
        it("Informs the generator about the premature exit", async () => {
            let exited = false;
            const generator = new GeneratorExtractor(async cb => {
                for (let i = 0; i < 5; i++) {
                    const finished = await cb(i);
                    if (exited) expect(true).toBeFalsy(); // This point shouldn't be reached when already exited
                    if (finished) exited = true;
                }
            });

            expect(await generator.next()).toEqual(0);
            expect(await generator.next()).toEqual(1);
            expect(generator.hasFinished()).toBeFalsy();
            expect(exited).toBeFalsy();
            generator.stop();
            expect(generator.hasFinished()).toBeTruthy();
            await wait();
            expect(exited).toBeTruthy();
            expect(await generator.next()).toEqual(undefined);
        });
    });

    describe("GeneratorExtractor.hasStarted", () => {
        let generator: GeneratorExtractor<number>;
        beforeEach(() => {
            generator = new GeneratorExtractor(async cb => {
                for (let i = 0; i < 5; i++) {
                    await cb(i);
                }
            });
        });

        it("Properly indicates whether the first item has been extracted", () => {
            expect(generator.hasStarted()).toBeFalsy();
            generator.next();
            expect(generator.hasStarted()).toBeTruthy();
        });
        it("Can be subscribed to", () => {
            const cb = jest.fn(() => {});
            expect(
                generator.hasStarted({
                    call: cb,
                    registerRemover: () => {},
                })
            ).toBeFalsy();
            expect(cb.mock.calls.length).toBe(0);
            generator.next();
            expect(cb.mock.calls.length).toBe(1);
        });
    });

    describe("GeneratorExtractor.hasFinished", () => {
        let generator: GeneratorExtractor<number>;
        beforeEach(() => {
            generator = new GeneratorExtractor(async cb => {
                for (let i = 0; i < 5; i++) {
                    await cb(i);
                }
            });
        });

        it("Properly indicates whether the last item is known to be extracted", async () => {
            await generator.next();
            await generator.next();
            await generator.next();
            await generator.next();
            await generator.next();
            expect(generator.hasFinished()).toBeFalsy();
            expect(await generator.next()).toEqual(undefined);
            expect(generator.hasFinished()).toBeTruthy();
        });
        it("Can be subscribed to", async () => {
            const cb = jest.fn(() => {});
            await generator.next();
            await generator.next();
            await generator.next();
            await generator.next();
            await generator.next();
            expect(
                generator.hasFinished({
                    call: cb,
                    registerRemover: () => {},
                })
            ).toBeFalsy();
            expect(cb.mock.calls.length).toBe(0);
            await generator.next();
            expect(cb.mock.calls.length).toBe(1);
        });
    });
});
