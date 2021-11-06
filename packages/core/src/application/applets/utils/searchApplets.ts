import {IAppletSearchData} from "../_types/IAppletSearchData";
import {
    IAppletSearchAPIResponse,
    IAppletSearchResponse,
} from "../_types/IAppletSearchResponse";
import Semver from "semver";
import {JSONSchemaForNPMPackageJsonFiles} from "@schemastore/package";
import {IAppletRepoInfo} from "../_types/IAppletRepoInfo";

/**
 * Searches for apples satisfying the given conditions
 * @param registryUrl The url of the registry to be searched
 * @param LMVersion The version of launchmenu for which to find compatible applets
 * @param search The data to be used to search for
 * @returns The list of applets
 */
export async function searchApplets(
    registryUrl: string,
    LMVersion: string,
    search: IAppletSearchData = {}
): Promise<IAppletSearchResponse | {error: string}> {
    const keywords = ["launchmenu applet", ...(search.keywords ?? [])];
    const searchText = `${search.search ? search.search + " " : ""}keywords:${keywords
        .map(kw => `"${kw}"`)
        .join("+")}`;

    // Fetch data based on the search
    const result = await fetch(
        `${registryUrl}-/v1/search?text=${encodeURIComponent(searchText)}&from=${
            search.offset ?? 0
        }&size=${search.limit ?? 20}`
    );

    if (!result.ok) return {error: result.statusText};

    // Augment the data by full package.jsons and filter invalid packages
    const lmPackage = "@launchmenu/core";
    const data: IAppletSearchAPIResponse = await result.json();
    const fullPackages = await Promise.all(
        data.objects.map(async packageData => {
            const {
                package: {name, version},
            } = packageData;
            const fullPackageData = await fetch(`${registryUrl}/${name}/${version}`);
            const fullPackage: JSONSchemaForNPMPackageJsonFiles & {icon?: string} =
                await fullPackageData.json();

            const packageMetaDataData = await fetch(`${registryUrl}/${name}`);
            const packageMetaData: {readme: string} = await packageMetaDataData.json();

            return {...packageData, fullPackage, packageMetaData};
        })
    );
    const validPackages = fullPackages.filter(({fullPackage: {dependencies}}) => {
        const requiredLMVersion = dependencies?.[lmPackage];
        if (!requiredLMVersion) return false;
        return search.hideIncompatible
            ? Semver.satisfies(LMVersion, requiredLMVersion)
            : true;
    });

    // Format the applet data
    const applets = validPackages.map<IAppletRepoInfo>(
        ({
            package: {name, description, version, keywords, links},
            fullPackage: {dependencies, icon},
            packageMetaData: {readme},
        }) => ({
            name,
            version,
            LMCompatibleVersion: dependencies![lmPackage]!,
            description: description ?? "",
            icon,
            readme,
            tags: keywords,
            website: links?.homepage ?? links?.repository,
        })
    );
    return {
        applets,
        totalCount: data.total,
    };
}
