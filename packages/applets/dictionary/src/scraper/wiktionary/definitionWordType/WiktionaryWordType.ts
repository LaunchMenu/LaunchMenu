import {DataCacher, IDataHook} from "model-react";
import {WiktionarySection} from "../baseSections/WiktionarySection";
import {getListItems} from "../util/getListItems";
import {WiktionaryPage} from "../WitkionaryPage";
import {INode} from "../_types/INode";
import {IUse} from "../_types/IUseDefinition";
import {IWord} from "../_types/IWord";
import {IWordTypeDefinition} from "../_types/IWordTypeDefinition";

/**
 * The class for word type sections in the wiktionary
 */
export class WiktionaryWordType extends WiktionarySection {
    protected definition = new DataCacher(h => {
        // Get the document
        const doc = this.getContentDom(h);
        const mainNode = doc?.firstElementChild;
        if (!mainNode)
            return {
                text: document.createElement("span"),
                uses: [],
            } as IWordTypeDefinition;

        // Retrieve the main word type
        const childNodes: Node[] = [];
        for (let [i, child] of mainNode.childNodes.entries()) {
            if (i > 0 && child.nodeName.match(/h[0-9]/)) break;
            childNodes.push(child.cloneNode(true));
        }
        const node = document.createElement("div");
        node.append(...childNodes);

        // Get the text and definitions
        const text =
            (childNodes.find(
                node => node instanceof HTMLParagraphElement
            ) as HTMLParagraphElement) ?? document.createElement("p");

        const definitions = getListItems(node, element => this.getUse(element));

        return {
            text,
            uses: definitions,
        };
    });

    /**
     * Extracts the use from a use node
     * @param node The node to extract the data from
     * @returns The use dage
     */
    protected getUse(node: INode): IUse {
        const wiki = this.getPage().getWiki();

        // Get the definition text
        let text = node.querySelector(".use-with-mention");
        if (!text) {
            const nodes: ChildNode[] = [];
            for (let child of node.childNodes) {
                if (child instanceof Element && child.tagName == "dl") break;
                nodes.push(child);
            }
            text = document.createElement("span");
            text.append(...nodes);
        }

        // Get the synonyms
        const synonymsNode = node.querySelector(".synonym") as HTMLElement;
        const synonyms =
            synonymsNode &&
            getListItems(synonymsNode, synonym => {
                const link = synonym.querySelector("a") as HTMLAnchorElement;
                if (!link) return;
                return {
                    word: link.textContent,
                    url: link.attributes.getNamedItem("href")?.textContent,
                    getPage: () => new WiktionaryPage(wiki, link.textContent ?? ""),
                };
            }).filter((item): item is IWord => !!item);

        // Get usage examples
        const examples = [...node.querySelectorAll(".h-usage-example")];

        // Return the definition
        return {
            text,
            synonyms: synonyms ?? [],
            examples,
        };
    }

    /**
     * Retrieves the definition
     * @param hook The hook to subscribe to changes
     */
    public getDefinition(hook?: IDataHook): IWordTypeDefinition {
        return this.definition.get(hook);
    }
}
