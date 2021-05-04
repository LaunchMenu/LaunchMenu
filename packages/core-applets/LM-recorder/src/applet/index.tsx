import {declare, Menu, searchAction, UILayer} from "@launchmenu/core";
import {createAudioRecorderItem} from "./UI/recordAudio/createAudioRecorderItem";
import {info, settings} from "./settings";
import {createVideoRecordersFolderItem} from "./UI/recordVideo/createVideoRecordersFolderItem";
import {globalExitBinding, stopScriptWatchers} from "./UI/recordVideo/watchRecordAction";

export default declare({
    info,
    settings,
    development: {
        watchDirectory: __dirname,
    },
    init: ({settings}) => {
        const {
            item: recordersFolder,
            destroy: disposeRecordingsWatcher,
        } = createVideoRecordersFolderItem(settings.recordingScriptsDir);
        const items = [createAudioRecorderItem(), recordersFolder];

        return {
            open: ({context, onClose}) => {
                context.open(
                    new UILayer(() => ({menu: new Menu(context, items), onClose}))
                );
            },
            search: async () => ({children: searchAction.get(items)}),
            globalContextMenuBindings: globalExitBinding,

            onDispose: () => {
                stopScriptWatchers();
                disposeRecordingsWatcher();
            },
        };
    },
});
