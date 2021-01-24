import {getAsync} from "model-react";
import {Wiktionary} from "./wiktionary/Wiktionary";

const wiki = new Wiktionary();
wiki.search("conscious")
    .then(pages =>
        getAsync(h =>
            pages[0].getLanguage("english", h)?.getDefinitions()[0]?.getDefinition(h)
        )
    )
    .then(definition => {
        console.log(
            definition?.uses.map(use => ({
                text: use.text.textContent,
                examples: use.examples.map(example => example.textContent),
                synonyms: use.synonyms,
            }))
        );
    });
