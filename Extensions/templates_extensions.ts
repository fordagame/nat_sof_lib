interface ITemplateResolver {
    getTemplate(templateName: string): (model: any) => string;
    loadTemplates(success: () => void): void;
    destroy(): void;
}

namespace dcore.plugins.templates {
    export class TemplateResolver implements ITemplateResolver {
        templates: any[];
        templateDictionary: Array<(model: any) => string>;
        templateNameFormat: (templateName: string) => string;
        constructor(templateDictionary: Array<(model: any) => string>, templateNameFormat: (templateName: string) => string) {
            this.templates = [];
            this.templateDictionary = templateDictionary;
            this.templateNameFormat = templateNameFormat;
        }
        getTemplate(templateName: string): (model: any) => string {
            if (!this.templates[templateName]) {
                this.templates[templateName] = this.templateDictionary[this.templateNameFormat(templateName)];
            }
            return this.templates[templateName];
        }
        loadTemplates(success: () => void): void {
            success();
        }
        destroy(): void {
            this.templates = [];
        }
    }
}

interface DCore {
    useTemplateResolver(templateResolver: ITemplateResolver): void;
    templates: ITemplateResolver;
}

interface DSandbox {
    getTemplate(templateName: string): (model: any) => string;
}

namespace dcore {
    export interface DefaultSandbox {
        getTemplate(templateName: string): (model: any) => string;
    }

    DefaultSandbox.prototype.getTemplate = function (templateName: string): (model: any) => string {
        return null;
    }

    export interface Instance {
        useTemplateResolver(templateResolver: ITemplateResolver): void;
        templates: ITemplateResolver;
    }

    export interface DefaultSandbox {
        getTemplate(templateName: string): (model: any) => string;
    }

    Instance.prototype.useTemplateResolver = function (templateResolver: ITemplateResolver): void {
        let that = <DCore>this;

        if (that.templates) {
            that.templates.destroy();
        }

        that.templates = templateResolver;
        that.Sandbox.prototype.getTemplate = function (templateName: string): any {
            return that.templates.getTemplate(templateName);
        }
    };
}