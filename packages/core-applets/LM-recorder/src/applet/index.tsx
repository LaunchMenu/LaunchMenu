import {declare, Menu, ProxiedMenu, searchAction, UILayer} from "@launchmenu/core";
import {createAudioRecorderItem} from "./UI/recordAudio/createAudioRecorderItem";
import {info, settings} from "./settings";
import {createVideoRecordersFolderItem} from "./UI/recordVideo/createVideoRecordersFolderItem";
import {
    globalExitBinding,
    isRecording,
    stopScriptWatchers,
} from "./UI/recordVideo/watchRecordAction";
import {IDataHook} from "model-react";

export * from "./exports";

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
        const items = (hook?: IDataHook) =>
            isRecording(hook) ? [] : [createAudioRecorderItem(), recordersFolder];

        return {
            open: ({context, onClose}) => {
                context.open(
                    new UILayer(() => ({menu: new ProxiedMenu(context, items), onClose}))
                );
            },
            search: async (query, hook) => ({children: searchAction.get(items(hook))}),
            globalContextMenuBindings: globalExitBinding,

            onDispose: () => {
                stopScriptWatchers();
                disposeRecordingsWatcher();
            },
        };
    },
});
