import React, {useMemo} from "react";
import {ITextField, LFC, SyntaxHighlighter, useTheme} from "@launchmenu/core";
import {NoteCategory} from "../../dataModel/NoteCategory";
import {useDataHook} from "model-react";
import {regexTokenizer} from "./actionHandlers/setSearchPatternAction";

/**
 * The summary content of the category
 */
export const CategoryContent: LFC<{category: NoteCategory}> = ({category}) => {
    const [hook] = useDataHook();
    const {highlighting} = useTheme();

    return (
        <table style={{tableLayout: "fixed", width: "100%"}}>
            <tbody>
                <tr>
                    <td style={{width: 100}}>Search pattern:</td>
                    <td>
                        <SyntaxHighlighter
                            theme={highlighting}
                            css={{whiteSpace: "break-spaces"}}
                            value={category.getSearchPattern(hook) ?? ""}
                            highlighter={regexTokenizer}
                        />
                    </td>
                </tr>
                <tr>
                    <td>Syntax:</td>
                    <td>{category.getSyntaxMode(hook)}</td>
                </tr>
                <tr>
                    <td>Rich content:</td>
                    <td>{category.getShowRichContent(hook).toString()}</td>
                </tr>
                <tr>
                    <td>Font size:</td>
                    <td>{category.getFontSize(hook)}</td>
                </tr>
                <tr>
                    <td>Search content:</td>
                    <td>{category.getSearchContent(hook).toString()}</td>
                </tr>
            </tbody>
        </table>
    );
};
