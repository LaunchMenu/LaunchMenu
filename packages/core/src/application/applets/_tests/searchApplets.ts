import {searchApplets} from "../utils/searchApplets";

describe("searchApplets", () => {
    const registryUrl = "https://registry.npmjs.com/";
    const LMVersion = "^0.0.0";
    (global as any).fetch = require("node-fetch/lib");

    it("Can find existing applets", async () => {
        const applets = await searchApplets(registryUrl, LMVersion);
        if ("error" in applets) {
            expect(applets).not.toContain("error");
        } else {
            expect(applets.totalCount).toBeGreaterThan(0);
        }
    });
    it("Can properly filter based on search", async () => {
        const allApplets = await searchApplets(registryUrl, LMVersion);
        if ("error" in allApplets) {
            expect(allApplets).not.toContain("error");
            return;
        }

        const applets = await searchApplets(registryUrl, LMVersion, {
            search: "notes",
        });
        if ("error" in applets) {
            expect(applets).not.toContain("error");
            return;
        }

        expect(applets.totalCount).toBeLessThan(allApplets.totalCount);
        expect(
            applets.applets.find(applet => applet.name == "@launchmenu/applet-notes")
        ).not.toBe(null);

        const noApplets = await searchApplets(registryUrl, LMVersion, {
            search: "boterbloempje",
        });
        if ("error" in noApplets) {
            expect(applets).not.toContain("error");
            return;
        }
        expect(noApplets.totalCount).toBe(0);
    });
});
