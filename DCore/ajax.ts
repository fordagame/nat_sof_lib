interface DCore {
    useAjax(): void;
    ajax(url: string, options: AjaxOptions): void;
}

interface DSandbox {
    ajax(url: string, options: AjaxOptions): void;
}

interface AjaxOptions {
    method?: string;
    contentType?: string;
    responseType?: string;
    data?: any;
    converter?<T>(result: string): T;
    success<T>(result: T): void;
    error?(reason: string): void;
}

namespace dcore {
    "use strict";

    export interface Instance {
        useAjax(): void;
        ajax(url: string, options: AjaxOptions): void;
    }

    export interface DefaultSandbox {
        ajax(url: string, options: AjaxOptions): void;
    }

    Instance.prototype.useAjax = function (): void {
        let that = <DCore>this;
        if (that.ajax) {
            return;
        }

        that.ajax = function (url: string, options: AjaxOptions): void {

            let request: AjaxOptions = {
                method: options.method || "GET",
                contentType: options.contentType || "application/json",
                responseType: options.responseType || "",
                converter: options.converter || function (response: string): string { return response; },
                success: options.success,
                error: options.error || function (reason): void { return; },
                data: options.data || "",
            };

            let xhr: any = new XMLHttpRequest();
            xhr.open(request.method, url, true);
            if (request.contentType != "empty") {
                xhr.setRequestHeader("Content-type", request.contentType);
            }
            xhr.responseType = request.responseType;
            xhr.onreadystatechange = () => {
                if (xhr.readyState === XMLHttpRequest.DONE) {
                    if (xhr.responseURL && xhr.responseURL.indexOf("Account/Login") != -1) {
                        window.location.href = "/Account/Login";
                    }
                    switch (xhr.status) {
                        case 200: request.success(request.converter(xhr.responseText)); break;
                        default:
                            request.error("Service error.");
                            break;
                    }
                }
            };
            xhr.send(request.data);
        };

        that.Sandbox.prototype.ajax = function (url: string, options: AjaxOptions): void {
            return this["core"].ajax(url, options);
        };
    };
}