import {ISettingsData, Observer, SettingsFile, SettingsManager} from "@launchmenu/core";
import {settings} from ".";

/**
 * Sets up automatic file saving if the setting is enabled
 * @param settingManager The setting manager to extract the settings from
 * @returns A function to destroy the save handler
 */
export function setupAutoSaveHandler(settingManager: SettingsManager): () => void {
    let settingsDataObserver: Observer<ISettingsData[]> | null = null;
    let settingsFiles: {file: SettingsFile; listener: () => void}[] = [];

    const autoSaveObserver = new Observer(h =>
        settingManager.getSettingsContext(h).get(settings).autoSave.get(h)
    ).listen(autoSave => {
        // Only do something if auto save actually changed
        if (autoSave != !!settingsDataObserver) {
            if (autoSave) {
                // Setup a save handler to react to changes
                settingsDataObserver = new Observer(h =>
                    settingManager.getAllSettingsData(h)
                ).listen(settingsData => {
                    // Obtain all files that were added and removed
                    const files = settingsData.map(({file}) => file);
                    const added = files.filter(
                        newFile => !settingsFiles.find(({file}) => newFile == file)
                    );
                    const removed = settingsFiles.filter(
                        ({file}) => !files.includes(file)
                    );

                    // Setup a listener for all added files
                    added.forEach(file => {
                        let timeoutID: NodeJS.Timeout | null = null;
                        const listener = () => {
                            if (timeoutID) return;
                            timeoutID = setTimeout(() => {
                                timeoutID = null;
                                if (file.isDirty()) file.save();
                            }, 100);
                        };
                        file.addChangeListener(listener);
                        settingsFiles.push({file, listener});
                    });

                    // Destroy the listener for all removed files
                    removed.forEach(({file, listener}) => {
                        file.removeChangeListener(listener);
                    });
                });

                // Save all currently dirty files
                settingManager.getAllDirtySettingsData().forEach(({file}) => file.save());
            } else {
                // Destroy the observer and all listeners
                settingsDataObserver?.destroy();
                settingsFiles.forEach(({file, listener}) => {
                    file.removeChangeListener(listener);
                });

                settingsFiles = [];
                settingsDataObserver = null;
            }
        }
    }, true);

    return () => {
        autoSaveObserver.destroy();
        settingsDataObserver?.destroy();
        settingsFiles.forEach(({file, listener}) => {
            file.removeChangeListener(listener);
        });
    };
}
