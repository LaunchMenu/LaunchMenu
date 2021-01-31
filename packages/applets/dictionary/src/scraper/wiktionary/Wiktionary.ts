import {Wiki} from "../wiki/Wiki";
import {WiktionaryPage} from "./WitkionaryPage";

export class Wiktionary extends Wiki<WiktionaryPage> {
    /**
     * Creates a new wiktionary instance (You shouldn't create multiple instances however)
     */
    public constructor() {
        super("https://en.wiktionary.org", title => new WiktionaryPage(this, title));
    }
}
