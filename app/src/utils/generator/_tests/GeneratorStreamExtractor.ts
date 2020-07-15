import {GeneratorStreamExtractor} from "../GeneratorStreamExtractor";
import {wait} from "../../../_tests/wait.helper";

describe("GeneratorStreamExtractor", () => {
    describe("new GeneratorStreamExtractor", () => {
        it("Properly creates an extractor", () => {
            new GeneratorStreamExtractor(
                async cb => {},
                () => {}
            );
        });
    });

    describe("GeneratorStreamExtractor.start", () => {
        it("Starts item retrieval", async () => {
            const items = [] as number[];
            const generator = new GeneratorStreamExtractor<number>(
                async cb => {
                    for (let i = 0; i < 5; i++) {
                        await cb(i);
                    }
                },
                item => {
                    items.push(item);
                }
            );
            await generator.start();
            expect(items).toEqual([0, 1, 2, 3, 4]);
        });
        it("Retrieves data asynchronously", async () => {
            const items = [] as number[];
            const generator = new GeneratorStreamExtractor<number>(
                async cb => {
                    for (let i = 0; i < 5; i++) {
                        await cb(i);
                    }
                },
                item => {
                    items.push(item);
                }
            );
            const promise = generator.start();
            expect(items).not.toEqual([0, 1, 2, 3, 4]);
            await promise;
            expect(items).toEqual([0, 1, 2, 3, 4]);
        });
    });

    describe("GeneratorStreamExtractor.pause", () => {
        it("Pauses item retrieval", async () => {
            const items = [] as number[];
            const generator = new GeneratorStreamExtractor<number>(
                async cb => {
                    for (let i = 0; i < 5; i++) {
                        await cb(i);
                    }
                },
                item => {
                    items.push(item);
                    if (items.length == 2) generator.pause();
                }
            );
            generator.start();
            await wait();
            expect(items).toEqual([0, 1]);
        });
        it("Can be continued from", async () => {
            const items = [] as number[];
            const generator = new GeneratorStreamExtractor<number>(
                async cb => {
                    for (let i = 0; i < 5; i++) {
                        await cb(i);
                    }
                },
                item => {
                    items.push(item);
                    if (items.length == 2) generator.pause();
                }
            );
            generator.start();
            await wait();
            expect(items).toEqual([0, 1]);
            await generator.start();
            expect(items).toEqual([0, 1, 2, 3, 4]);
        });
    });

    describe("GeneratorStreamExtractor.stop", () => {
        it("Stops item retrieval", async () => {
            const items = [] as number[];
            const generator = new GeneratorStreamExtractor<number>(
                async cb => {
                    for (let i = 0; i < 5; i++) {
                        await cb(i);
                    }
                },
                item => {
                    items.push(item);
                    if (items.length == 2) generator.stop();
                }
            );
            await generator.start();
            expect(items).toEqual([0, 1]);
        });
        it("Prevents item retrieval from continuing", async () => {
            const items = [] as number[];
            const generator = new GeneratorStreamExtractor<number>(
                async cb => {
                    for (let i = 0; i < 5; i++) {
                        await cb(i);
                    }
                },
                item => {
                    items.push(item);
                    if (items.length == 2) generator.stop();
                }
            );
            await generator.start();
            expect(items).toEqual([0, 1]);
            expect(() => generator.start()).toThrow();
            expect(items).toEqual([0, 1]);
        });
        it("Informs the generator about the premature exit", async () => {
            const items = [] as number[];
            let exited = false;
            const generator = new GeneratorStreamExtractor<number>(
                async cb => {
                    for (let i = 0; i < 5; i++) {
                        const finished = await cb(i);
                        if (exited) expect(true).toBeFalsy(); // This point shouldn't be reached when already exited
                        if (finished) exited = true;
                    }
                },
                item => {
                    items.push(item);
                    if (items.length == 2) generator.stop();
                }
            );
            await generator.start();
            expect(items).toEqual([0, 1]);
            await wait();
            expect(items).toEqual([0, 1]);
            expect(exited).toBe(true);
        });
    });

    describe("GeneratorStreamExtractor.hasStarted", () => {
        const items = [] as number[];
        let generator: GeneratorStreamExtractor<number>;
        beforeEach(() => {
            generator = new GeneratorStreamExtractor(
                async cb => {
                    for (let i = 0; i < 5; i++) {
                        await cb(i);
                    }
                },
                item => {
                    items.push(item);
                    if (items.length == 2) generator.stop();
                }
            );
        });

        it("Properly indicates whether the extraction has been started", () => {
            expect(generator.hasStarted()).toBeFalsy();
            const p = generator.start();
            expect(generator.hasStarted()).toBeTruthy();
            return p;
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
            const p = generator.start();
            expect(cb.mock.calls.length).toBe(1);
            return p;
        });
    });

    describe("GeneratorStreamExtractor.isPaused", () => {
        it("Properly indicates whether the extraction has been paused", async () => {
            const items = [] as number[];
            const generator = new GeneratorStreamExtractor<number>(
                async cb => {
                    for (let i = 0; i < 5; i++) {
                        await cb(i);
                    }
                },
                item => {
                    items.push(item);
                    if (items.length == 2) generator.pause();
                }
            );
            generator.start();
            expect(generator.isPaused()).toBeFalsy();
            await wait();
            expect(items).toEqual([0, 1]);
            expect(generator.isPaused()).toBeTruthy();
            const p = generator.start();
            expect(generator.isPaused()).toBeFalsy();
            await p;
        });
        it("Can be subscribed to", async () => {
            const items = [] as number[];
            const generator = new GeneratorStreamExtractor<number>(
                async cb => {
                    for (let i = 0; i < 5; i++) {
                        await cb(i);
                    }
                },
                item => {
                    items.push(item);
                    if (items.length == 2) generator.pause();
                }
            );
            generator.start();
            const cb = jest.fn(() => {});
            expect(
                generator.isPaused({
                    call: cb,
                    registerRemover: () => {},
                })
            ).toBeFalsy();
            expect(cb.mock.calls.length).toBe(0);
            await wait();
            expect(cb.mock.calls.length).toBe(1);
        });
    });

    describe("GeneratorStreamExtractor.hasFinished", () => {
        it("Properly indicates whether the extraction has been finished", async () => {
            const items = [] as number[];
            const generator = new GeneratorStreamExtractor<number>(
                async cb => {
                    for (let i = 0; i < 5; i++) {
                        await cb(i);
                    }
                },
                item => {
                    items.push(item);
                }
            );
            const p = generator.start();
            expect(generator.hasFinished()).toBeFalsy();
            await p;
            expect(generator.hasFinished()).toBeTruthy();
        });
        it("Can be subscribed to", async () => {
            const items = [] as number[];
            const generator = new GeneratorStreamExtractor<number>(
                async cb => {
                    for (let i = 0; i < 5; i++) {
                        await cb(i);
                    }
                },
                item => {
                    items.push(item);
                }
            );
            const p = generator.start();
            const cb = jest.fn(() => {});
            expect(
                generator.hasFinished({
                    call: cb,
                    registerRemover: () => {},
                })
            ).toBeFalsy();
            expect(cb.mock.calls.length).toBe(0);
            await p;
            expect(cb.mock.calls.length).toBe(1);
        });
    });
});
