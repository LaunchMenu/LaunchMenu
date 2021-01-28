import {createAction} from "../../../createAction";
import {clipboard} from "electron";
import {Data, NativeImage} from "electron";
import {copyExecuteHandler} from "../copyExecuteHandler";

/** A copy execute handler that uses electron's clipboard */
export const copyClipboardHandler = createAction({
    name: "Clipboard copy",
    parents: [copyExecuteHandler],
    core: (data: Data[]) => {
        const getData = () => ({
            text: data
                .map(data => data.text)
                .filter((text): text is string => !!text)
                .join(""),
            html: data
                .map(data => data.html)
                .filter((html): html is string => !!html)
                .join(""),
            rtf: data
                .map(data => data.rtf)
                .filter((rtf): rtf is string => !!rtf)
                .join(""),
            image: data
                .map(data => data.image)
                .filter((image): image is NativeImage => !!image)[0],
            bookmark: data
                .map(data => data.bookmark)
                .filter((bookmark): bookmark is string => !!bookmark)[0],
        });
        const copy = () => void clipboard.write(getData());
        return {
            result: {
                /** Retrieves the data for the clipboard */
                getData,
                /** Copies the data to the clipboard  */
                copy,
            },
            children: [copyExecuteHandler.createBinding(copy)],
        };
    },
});
