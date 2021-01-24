import {SearchCache} from "../SearchCache";

describe("SearchCache", () => {
    describe("new SearchCache", () => {
        it("Properly creates a search cache", () => {
            new SearchCache(() => 5);
        });
    });
    describe("SearchCache.get", () => {
        describe("1 part key", () => {
            it("Retrieves the item", () => {
                const cache = new SearchCache((key: number) => key * 5);
                expect(cache.get(5)).toBe(25);
                expect(cache.get(1)).toBe(5);
            });
            it("Caches the item", () => {
                const cache = new SearchCache((key: number) => Math.random());
                const v23 = cache.get(23);
                const v3 = cache.get(3);
                expect(cache.get(23)).toBe(v23);
                expect(cache.get(3)).toBe(v3);
            });
            it("Deletes the item when capacity is hit", () => {
                const cache = new SearchCache((key: number) => Math.random(), 2);
                const v23 = cache.get(23);
                expect(cache.get(23)).toBe(v23);
                cache.get(5);
                cache.get(6);
                expect(cache.get(23)).not.toBe(v23);
            });
        });
        describe("multiple part keys", () => {
            it("Retrieves the item", () => {
                const cache = new SearchCache(
                    (k1: number, k2: string, k3: boolean) => k1 * 5
                );
                expect(cache.get(5, "hoi", false)).toBe(25);
                expect(cache.get(1, "bye", true)).toBe(5);
            });
            it("Caches the item", () => {
                const cache = new SearchCache((k1: number, k2: string, k3: boolean) =>
                    Math.random()
                );
                const v1 = cache.get(23, "hoi", false);
                const v2 = cache.get(3, "bye", true);
                const v3 = cache.get(23, "hoi", true);
                const v4 = cache.get(23, "stuff", false);
                expect(cache.get(23, "hoi", false)).toBe(v1);
                expect(cache.get(3, "bye", true)).toBe(v2);
                expect(v3).not.toBe(v1);
                expect(v4).not.toBe(v1);
            });
            it("Deletes the item when capacity is hit", () => {
                const cache = new SearchCache(
                    (k1: number, k2: string, k3: boolean) => Math.random(),
                    2
                );
                const v23 = cache.get(23, "hoi", false);
                expect(cache.get(23, "hoi", false)).toBe(v23);
                cache.get(23, "shit", true);
                cache.get(23, "hoi", true);
                expect(cache.get(23, "hoi", false)).not.toBe(v23);
            });
        });
        it("Cleans up the cache", () => {
            const cache = new SearchCache(
                (k1: number, k2: string, k3: boolean) => Math.random(),
                2
            );
            cache.get(23, "hoi", false);
            expect((cache as any).map.get(23)).not.toBe(undefined);
            cache.get(2, "shit", true);
            cache.get(3, "hoi", true);
            expect((cache as any).map.get(23)).toBe(undefined);
        });
    });
    describe("SearchCache.getAll", () => {
        it("Retrieves all items for 1 part keys", () => {
            const cache = new SearchCache((k1: number) => k1);
            expect(cache.getAll([25, 50, 75, 100])).toEqual([25, 50, 75, 100]);
        });
        it("Retrieves all items for multiple part keys", () => {
            const cache = new SearchCache((k1: number, k2: string, k3: boolean) => k1);
            expect(
                cache.getAll([
                    [24, "yes", true],
                    [22, "", false],
                ])
            ).toEqual([24, 22]);
        });
    });
});
