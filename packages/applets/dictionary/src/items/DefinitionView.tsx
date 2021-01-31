import React from "react";
import {Loader} from "model-react";
import {Box, LFC} from "@launchmenu/core";
import {Html} from "../sanitize/Html";
import {Wiktionary} from "../Wiktionary";
import {ILanguage} from "../_types/ILanguage";

/**
 * Shows the definitions for a given word
 */
export const DefinitionView: LFC<{word: string; language?: ILanguage}> = ({
    word,
    language,
}) => (
    <Loader>
        {h =>
            (language
                ? Wiktionary.get(word, language, h)
                : Wiktionary.getAll(word, h)
            ).map((type, i) => (
                <Box key={i}>
                    <Box>{type.category}</Box>
                    <ul>
                        {type.definitions.map(({definition, examples}, j) => (
                            <Box key={j} as="li">
                                <Html content={definition} />
                                <Box marginLeft="large">
                                    {examples.map(({example, translation}, k) => (
                                        <Box marginBottom="medium" key={k}>
                                            <Html content={example} />
                                            {translation && (
                                                <Box>
                                                    {" "}
                                                    - <Html content={translation} />
                                                </Box>
                                            )}
                                        </Box>
                                    ))}
                                </Box>
                            </Box>
                        ))}
                    </ul>
                </Box>
            ))
        }
    </Loader>
);
