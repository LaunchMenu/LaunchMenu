const Path = require("path");
const FS = require("fs");
const {promisify} = require("util");

const appletsFilePath = Path.join(process.cwd(), "data", "settings", "applets.json");
if (!FS.existsSync(appletsFilePath)) {
    (async () => {
        const coreAppletsDir = Path.join(process.cwd(), "..", "core-applets");
        const coreDirNames = await promisify(FS.readdir)(coreAppletsDir);

        const appletsDir = Path.join(process.cwd(), "..", "applets");
        const dirNames = await promisify(FS.readdir)(appletsDir);

        // Retrieves the paths to all the applets to be installed
        const paths = [
            ...coreDirNames.map(file => ({
                name: file,
                path: Path.join(coreAppletsDir, file),
            })),
            ...dirNames.map(file => ({name: file, path: Path.join(appletsDir, file)})),
        ];

        // Filter out any non applets
        const applets = (
            await Promise.all(
                paths.map(async ({name, path}) => {
                    const stats = await promisify(FS.lstat)(path);
                    if (!stats.isDirectory()) return null;

                    const exists = FS.existsSync(path);
                    if (!exists) return null;

                    return {name, path};
                })
            )
        ).filter(p => p != null);

        // Prepare the file format
        const appletsFileContent = {};
        applets.forEach(({name, path}) => {
            appletsFileContent[name] = path;
        });

        // Create the directory, and write the file
        const settingsDir = Path.dirname(appletsFilePath);
        await promisify(FS.mkdir)(settingsDir, {recursive: true});

        await promisify(FS.writeFile)(
            appletsFilePath,
            JSON.stringify(appletsFileContent, null, 4),
            "UTF8"
        );
    })().catch(err => {
        throw err;
    });
}
