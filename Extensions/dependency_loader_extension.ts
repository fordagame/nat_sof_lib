interface IConcreteDependencyResolver
{
    resolve(dependencyOptions: any, success: () => void): void
}

interface IDependency {
    name: string;
    options: Object;
}

interface IDependencyLoader {
    require(dependencies: IDependency[], success: (status: boolean, errorMessage: string) => void): void;
    destroy(): void;
}

namespace dcore.plugins.dependency {
    export class DependencyLoader implements IDependencyLoader {
        loadedDependencies: string[];
        concreteResolvers: IConcreteDependencyResolver[];
        constructor(concreteResolvers: IConcreteDependencyResolver[]) {
            this.loadedDependencies = [];
            this.concreteResolvers = concreteResolvers;
        }

        require(dependencies: IDependency[], success: (status: boolean, errorMessage: string) => void): void {
            if (dependencies.length == 0) {
                success(true, "");
            }
            else {
                let dependencny: IDependency = dependencies.pop();
                let that: DependencyLoader = this;
                let concreteResolver: IConcreteDependencyResolver = this.concreteResolvers[dependencny.name]
                if (concreteResolver) {
                    concreteResolver.resolve(dependencny.options, function () {
                        that.require(dependencies, success);
                    });
                }
                else {
                    success(false, "Depdencny resolver for " + dependencny.name + " was not found");
                }
            }
        }

        destroy(): void {

        }
    }
}

interface DCore {
    useDependencyLoader(concreteResolvers: IConcreteDependencyResolver[]): void;
    dependency: IDependencyLoader;
}

interface DSandbox {
    getDependencyLoader(): IDependencyLoader;
}

namespace dcore {
    export interface DefaultSandbox{
        getDependencyLoader(): IDependencyLoader;
    }

    DefaultSandbox.prototype.getDependencyLoader = function (): IDependencyLoader {
        return null;
    }

    export interface Instance {
        useDependencyLoader(concreteResolvers: IConcreteDependencyResolver[]): void;
        dependency: IDependencyLoader;
    }

    export interface DefaultSandbox {
        getDependencyLoader(): IDependencyLoader;
    }

    Instance.prototype.useDependencyLoader = function (concreteResolvers: IConcreteDependencyResolver[]): void {
        let that = <DCore>this;

        if (that.dependency) {
            that.dependency.destroy();
        }

        that.dependency = new dcore.plugins.dependency.DependencyLoader(concreteResolvers);
        that.Sandbox.prototype.getDependencyLoader = function (): any {
            return that.dependency;
        }
    };
}