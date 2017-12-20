interface ILanguageResourceLoader {
    loadLanguageResource(resourceName: string, language, success: (resourceName: string, result: Array<string>) => void);
}

interface ILocalization {
    loadResource(resourceName: string, success: (resourceName: string) => void): void;
    changeLanguage(language: string): void;
    translate(resourceName: string, key: string): string;
    getResources(resourceName: string): Array<string>;
    getAllResources(): Array<Array<string>>;
    isResourceLoaded(resourceName: string): boolean;
    destroy(): void;
    currentLanguage: string;
}

namespace dcore.plugins.localization {
    export class Localization implements ILocalization {
        resources: Array<Array<string>>;
        resourceLoader: ILanguageResourceLoader;
        currentLanguage: string;
        loadedResources: string[];
        onSuccessFunctions: any[];
        constructor(resourceLoader: ILanguageResourceLoader, defaultLanguage: string) {
            this.resources = [];
            this.resourceLoader = resourceLoader;
            this.currentLanguage = defaultLanguage;
            this.loadedResources = [];
            this.onSuccessFunctions = [];
        }

        loadResource(resourceName: string, success: (resourceName: string) => void): void {
            if (!this.onSuccessFunctions[resourceName]) {
                this.onSuccessFunctions[resourceName] = [];
            }

            if (this.onSuccessFunctions[resourceName].length == 0) {
                this.resourceLoader.loadLanguageResource(resourceName, this.currentLanguage, this.loadResourcesSuccess.bind(this));
            }
            this.onSuccessFunctions[resourceName].push(success);
        }

        changeLanguage(language: string): void {
            this.currentLanguage = language;
            for (var i in this.loadedResources) {
                this.loadedResources[i] = "notloaded";
            }
        }

        loadResourcesSuccess(resourceName: string, result: Array<string>) {
            this.resources[resourceName] = result;
            this.loadedResources[resourceName] = "loaded";
            for (var i = 0; i < this.onSuccessFunctions[resourceName].length; i++) {
                this.onSuccessFunctions[resourceName][i](resourceName);
            }
            this.onSuccessFunctions[resourceName] = [];
        }

        translate(resourceName: string, key: string): string {
            if (this.resources[resourceName]) {
                return this.resources[resourceName][key];
            }
        }

        getResources(resourceName: string): Array<string> {
            return this.resources[resourceName];
        }

        getAllResources(): Array<Array<string>> {
            return this.resources;
        }

        isResourceLoaded(resourceName: string): boolean
        {
            return this.loadedResources[resourceName] == "loaded";
        }

        destroy(): void {

        }
    }
}

interface DCore {
    useLocalization(resourceLoader: ILanguageResourceLoader, defaultLanguage: string): void;
    localization: ILocalization;
}

interface DSandbox {
    getLocalization(): ILocalization;
}

namespace dcore {
    export interface Instance {
        useLocalization(resourceLoader: ILanguageResourceLoader, defaultLanguage: string): void;
        localization: ILocalization;
    }

    export interface DefaultSandbox {
        getLocalization(): ILocalization;
    }

    Instance.prototype.useLocalization = function (resourceLoader: ILanguageResourceLoader, defaultLanguage: string): void {
        let that = <DCore>this;

        if (that.localization) {
            that.localization.destroy();
        }

        that.localization = new dcore.plugins.localization.Localization(resourceLoader, defaultLanguage);
        that.Sandbox.prototype.getLocalization = function (): any {
            return that.localization;
        }
    };
}