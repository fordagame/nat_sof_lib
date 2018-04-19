interface IBaseView {
    render(model: any): HTMLElement;
}

namespace dcore.plugins.mvp_extension {
    export class BaseView extends dcore.plugins.mvp.View implements IBaseView {
        protected template: (model: any) => string;

        constructor(root: HTMLElement, template?: (model: any) => string) {
            super(root)

            this.template = template;
        }

        /**
         *  Renders the view.
         *  @returns {HTMLElement}
         */
        render(model: any): HTMLElement {
            let root: HTMLElement = super.render(model);
            if (this.template) {
                root.innerHTML = this.template.call(this, model);
            }
            root.classList.remove("invalid"); //We want to remove invalid border if we re-render the view.
            return root;
        }

        partialRender(model: any, partialSelector: string) {
            if (this.template) {
                let rootElement: HTMLElement = document.createElement("div");
                rootElement.innerHTML = this.template.call(this, model);
                let partialContainer: HTMLElement = <HTMLElement>rootElement.querySelector(partialSelector);
                let rootPartialContainer: HTMLElement = <HTMLElement>this.root.querySelector(partialSelector);
                if (rootPartialContainer && partialContainer) {
                    rootPartialContainer.innerHTML = partialContainer.innerHTML;
                }
            }
        }

        partialAppend(model: any, partialSelector: string) {
            if (this.template) {
                let rootElement: HTMLElement = document.createElement("div");
                rootElement.innerHTML = this.template.call(this, model);
                let partialContainer: HTMLElement = <HTMLElement>rootElement.querySelector(partialSelector);
                let rootPartialContainer: HTMLElement = <HTMLElement>this.root.querySelector(partialSelector);
                if (rootPartialContainer && partialContainer) {
                    while (partialContainer.children.length > 0) {
                        rootPartialContainer.appendChild(partialContainer.children[0]);
                    }
                }
            }
        }

        partialPrepend(model: any, partialSelector: string) {
            if (this.template) {
                let rootElement: HTMLElement = document.createElement("div");
                rootElement.innerHTML = this.template.call(this, model);
                let partialContainer: HTMLElement = <HTMLElement>rootElement.querySelector(partialSelector);
                let rootPartialContainer: HTMLElement = <HTMLElement>this.root.querySelector(partialSelector);
                if (rootPartialContainer && partialContainer) {
                    while (partialContainer.children.length > 0) {
                        rootPartialContainer.insertBefore(partialContainer.children[0], rootPartialContainer.children[0]);
                    }
                }
            }
        }

        getValue(selector: string): string {
            let element: HTMLInputElement = (<HTMLInputElement>this.root.querySelector(selector));
            if (element) {
                return element.value;
            }
            return "";
        }

        getMultipleValue(selector: string): string[] {
            let input: HTMLInputElement = <HTMLInputElement>this.root.querySelector(selector);
            let options: NodeListOf<Element> = input.querySelectorAll("option:checked");
            let result: string[] = [];
            for (var i = 0; i < options.length; i++) {
                let option: HTMLInputElement = <HTMLInputElement>options[i];
                result.push(option.value);
            }
            return result;
        }

        getInt(selector: string): number {
            let val: string = this.getValue(selector);
            if (val) {
                return parseInt(val);
            }
            else {
                return 0;
            }
        }

        getIntNullable(selector: string): number {
            let val: string = this.getValue(selector);
            if (val) {
                return parseInt(val);
            }
            else {
                return null;
            }
        }

        getFloat(selector: string): number {
            let val: string = this.getValue(selector);
            if (val) {
                return parseFloat(val);
            }
            else {
                return 0;
            }
        }

        getFloatNullable(selector: string): number {
            let val: string = this.getValue(selector);
            if (val) {
                return parseFloat(val);
            }
            else {
                return null;
            }
        }

        getMultipleInt(selector: string): number[] {
            let stringResult: string[] = this.getMultipleValue(selector);
            let result: number[] = []
            for (var i = 0; i < stringResult.length; i++) {
                result.push(parseInt(stringResult[i]));
            }
            return result;
        }

        getDate(selector: string): Date {
            return new Date(this.getValue(selector));
        }

        getTime(selector: string): Date {
            let time: string[] = this.getValue(selector).split(":");
            let selectedDate: Date = new Date(Date.UTC(2016, 1, 1, parseInt(time[0]), parseInt(time[1])));
            return selectedDate;
        }

        getBoolean(selector: string): boolean {
            let element: HTMLInputElement = (<HTMLInputElement>this.root.querySelector(selector));
            if (element) {
                return element.checked;
            }
            else {
                return false;
            }
        }

        setValue(selector: string, value: string) {
            let element: HTMLInputElement = <HTMLInputElement>this.root.querySelector(selector);
            element.value = value;
        }

        setInnerText(selector: string, text: string) {
            let element: HTMLElement = <HTMLElement>this.root.querySelector(selector);
            element.innerText = text;
        }

        setHTML(selector: string, html: string) {
            let element: HTMLElement = <HTMLElement>this.root.querySelector(selector);
            element.innerHTML = html;
        }

        appendHTML(selector: string, html: HTMLElement) {
            let element: HTMLElement = <HTMLElement>this.root.querySelector(selector);
            element.appendChild(html);
        }

        destroy() {
            this.root.remove();
            super.destroy();
        }

        validateForm(selector) {
            let result: boolean = true;
            let validationElements: NodeListOf<Element> = this.root.querySelectorAll(selector);
            for (var i = 0; i < validationElements.length; i++) {
                result = this.validateField(<HTMLInputElement>validationElements[i]) && result;
            }
            return result;
        }

        validateRequired(element: HTMLInputElement): boolean {
            if (element.attributes["data-required"]) {
                if (!element.value) {
                    element.classList.add("invalid-required");
                    return false;
                }
            }
            element.classList.remove("invalid-required");
            return true;
        }

        validateRange(element: HTMLInputElement): boolean {
            if (element.attributes["data-range"]) {
                let value: number = parseFloat(element.value);
                if (isNaN(value)) {
                    return false;
                }
                let ranges: string = element.attributes["data-range"].value.split("|");
                let result: boolean = false;
                for (var i = 0; i < ranges.length; i++) {
                    let values: string[] = ranges[i].split(";");
                    let botRange: number = parseFloat(values[0]);
                    let topRange: number = parseFloat(values[1]);
                    let relatedValue: number = 0;
                    if (values.length == 3) {
                        relatedValue = parseFloat((<HTMLInputElement>this.root.querySelector(values[2])).value);
                        if (isNaN(relatedValue)) {
                            return false;
                        }
                    }
                    result = result || (relatedValue + botRange) <= value && value <= (relatedValue + topRange);
                }
                return result;
            }
            return true;
        }

        validateNotEqual(element: HTMLInputElement): boolean {
            if (element.attributes["data-notequal"]) {
                let value: string = element.value;
                if (!value) {
                    return false;
                }

                let values: string[] = element.attributes["data-notequal"].value.split(";");
                let relatedValue: string = (<HTMLInputElement>this.root.querySelector(values[0])).value;
                let typeOfValue: string = values[1];
                return this.validateFunction(value, relatedValue, typeOfValue, function (v1: any, v2: any) { return v1 != v2; });
            }
            return true;
        }

        validateEqual(element: HTMLInputElement): boolean {
            if (element.attributes["data-equal"]) {
                let value: string = element.value;
                if (!value) {
                    return false;
                }

                let values: string[] = element.attributes["data-equal"].value.split(";");
                let relatedValue: string = (<HTMLInputElement>this.root.querySelector(values[0])).value;
                let typeOfValue: string = values[1];
                return this.validateFunction(value, relatedValue, typeOfValue, function (v1: any, v2: any) { return v1 == v2; });
            }
            return true;
        }

        validateBigger(element: HTMLInputElement): boolean {
            if (element.attributes["data-bigger"]) {
                let value: string = element.value;
                if (!value) {
                    return false;
                }

                let values: string[] = element.attributes["data-bigger"].value.split(";");
                let relatedValue: string = (<HTMLInputElement>this.root.querySelector(values[0])).value;
                let typeOfValue: string = values[1];
                return this.validateFunction(value, relatedValue, typeOfValue, function (v1: any, v2: any) { return v1 > v2; });
            }
            return true;
        }

        validateLower(element: HTMLInputElement): boolean {
            if (element.attributes["data-lower"]) {
                let value: string = element.value;
                if (!value) {
                    return false;
                }

                let values: string[] = element.attributes["data-lower"].value.split(";");
                let relatedValue: string = (<HTMLInputElement>this.root.querySelector(values[0])).value;
                let typeOfValue: string = values[1];
                return this.validateFunction(value, relatedValue, typeOfValue, function (v1: any, v2: any) { return v1 < v2; });
            }
            return true;
        }

        validateFunction(v1: string, v2: string, typeOfValue: string, compareFunction: (v1: any, v2: any) => boolean): boolean {
            switch (typeOfValue) {
                case "string":
                    return compareFunction(v1, v2);
                case "date":
                    let v1d: Date = new Date(v1);
                    let v2d: Date = new Date(v2);
                    return compareFunction(v1d, v2d);
                case "time":
                    let v1t: Date = new Date("01/01/2000 " + v1);
                    let v2t: Date = new Date("01/01/2000 " + v2);
                    if (v1 == "00:00" && v2 == "00:00") {
                        return true;
                    }
                    return compareFunction(v1t, v2t);
                case "number":
                default:
                    let v1n: number = parseFloat(v1);
                    let v2n: number = parseFloat(v2);
                    return compareFunction(v1n, v2n);

            }
        }

        validatePattern(element: HTMLInputElement): boolean {
            if (element.attributes["data-pattern"]) {
                let value: string = element.value;
                let pattern: string = element.attributes["data-pattern"].value;
                let result: string[] = value.match(pattern);
                return result && result.length == 1 && result[0] == value;
            }
            return true;
        }

        validateTime(element: HTMLInputElement): boolean {
            if (element.attributes["data-time"]) {
                let value: string = element.value;
                let time: string[] = value.split(":");
                if (time.length != 2) {
                    return false;
                }
                let hours: number = parseInt(time[0]);
                let minutes: number = parseInt(time[1]);
                if (isNaN(hours) || isNaN(minutes)) {
                    return false;
                }
                if (!(hours >= 0 && hours <= 23)) {
                    return false;
                }
                if (!(minutes >= 0 && minutes <= 59)) {
                    return false;
                }
            }
            return true;
        }

        recheckValidation(element: HTMLInputElement) {
            if (element.attributes["data-revalidate"]) {
                let recheckInputs: string[] = element.attributes["data-revalidate"].value.split(";");
                for (var i = 0; i < recheckInputs.length; i++) {
                    this.validateField(<HTMLInputElement>this.root.querySelector(recheckInputs[i]));
                }
            }
        }

        validateField(element: HTMLInputElement): boolean {
            let result: boolean = true;
            let tooltip: string[] = [];
            let name: string = element.name;
            if (!this.validateRequired(element)) {
                tooltip.push(element.dataset["invalidrequired"]);
                element.classList.add("invalid-required");
            }
            else {
                element.classList.remove("invalidrequired");
            }

            if (!this.validateRange(element)) {
                tooltip.push(element.dataset["invalidrange"]);
                element.classList.add("invalid-range");
            }
            else {
                element.classList.remove("invalid-range");
            }

            if (!this.validatePattern(element)) {
                tooltip.push(element.dataset["invalidpattern"]);
                element.classList.add("invalid-pattern");
            }
            else {
                element.classList.remove("invalid-pattern");
            }

            if (!this.validateBigger(element)) {
                tooltip.push(element.dataset["invalidbigger"]);
                element.classList.add("invalid-bigger");
            }
            else {
                element.classList.remove("invalid-bigger");
            }

            if (!this.validateLower(element)) {
                tooltip.push(element.dataset["invalidlower"]);
                element.classList.add("invalid-lower");
            }
            else {
                element.classList.remove("invalid-lower");
            }

            if (!this.validateNotEqual(element)) {
                tooltip.push(element.dataset["invalidnotequal"]);
                element.classList.add("invalid-notequal");
            }
            else {
                element.classList.remove("invalid-notequal");
            }

            if (!this.validateEqual(element)) {
                tooltip.push(element.dataset["invalidequal"]);
                element.classList.add("invalid-equal");
            }
            else {
                element.classList.remove("invalid-equal");
            }

            if (!this.validateTime(element)) {
                tooltip.push(element.dataset["invalidtime"]);
                element.classList.add("invalid-time");
            }
            else {
                element.classList.remove("invalid-time");
            }

            if (tooltip.length > 0) {
                result = false;
            }
            let toolTipText: string = tooltip.join(". ");
            element.setAttribute("title", toolTipText);
            if (name) {
                let validationContainer: HTMLElement = <HTMLElement>this.root.querySelector(".validation");
                if (validationContainer) {
                    let validationBox: HTMLElement = <HTMLElement>validationContainer.querySelector("#validation_" + name);
                    if (validationBox) {
                        validationBox.remove();
                        if (validationContainer.innerHTML.trim() == "") {
                            validationContainer.classList.add("display-none");
                        }
                    }
                    if (toolTipText.trim()) {
                        let container: HTMLElement = document.createElement("div");
                        container.id = "validation_" + name;
                        container.classList.add("invalid-color");
                        container.innerHTML = tooltip.join(". ");
                        validationContainer.appendChild(container);
                        validationContainer.classList.remove("display-none");
                    }
                }
            }
            return result;
        }

        checkValidation(ev: Event) {
            this.validateField(<HTMLInputElement>ev.target);
            this.recheckValidation(<HTMLInputElement>ev.target);
        }

        add_edit_events(edit_callback: (ev: Event) => void) {
            this.addEventListener({
                type: "change",
                selector: "input",
                listener: edit_callback
            });

            this.addEventListener({
                type: "change",
                selector: "select",
                listener: edit_callback
            });

            this.addEventListener({
                type: "click",
                selector: "input",
                listener: edit_callback
            });

            this.addEventListener({
                type: "click",
                selector: "select",
                listener: edit_callback
            });
        }

        add_validation_events() {
            this.addEventListener({
                type: "change",
                selector: ".validate",
                listener: this.checkValidation
            });
        }

        stop_propagation_events() {
            this.addEventListener({
                type: "click",
                selector: ".w3-dropdown-content",
                listener: this.stop_propagation
            });
        }

        stop_propagation(ev: Event) {
            ev.cancelBubble = true;
        }

        add_step_events() {
            this.addEventListener({
                type: "change",
                selector: "[data-step]",
                listener: this.change_step
            });
        }

        change_step(ev: Event) {
            let element: HTMLInputElement = <HTMLInputElement>ev.target;
            let value = parseFloat(element.value);

            let step: number = 1;
            let steps: string[] = element.dataset["step"].split("|");

            if (steps.length > 1) {
                let ranges: string[] = element.dataset["range"].split("|");
                for (var i = 0; i < ranges.length; i++) {
                    let boundaries: string[] = ranges[i].split(";");
                    let bot: number = parseFloat(boundaries[0]);
                    let top: number = parseFloat(boundaries[1]);
                    if (value >= bot && value <= top) {
                        step = parseFloat(steps[i]);
                        element.step = step.toString();
                        break;
                    }
                }
            }
            else {
                step = parseFloat(element.dataset["step"]);
            }

            let floorValue = value;
            if (step >= 1 && value / step != floorValue) {
                element.value = (value - (value % step)).toString();
            }
            else {
                let mvalue: number = value * 10 * 10;
                let mstep: number = step * 10 * 10;
                element.value = ((mvalue - (mvalue % mstep)) / (10 * 10)).toString();
            }
            element.setAttribute("value", element.value);
        }

        add_editable_event(event_handler: (value: string, event: string, id: string) => void) {
            this.addEventListener({
                type: "click",
                selector: "[data-editable]",
                listener: this.editable_box_click.bind(this, event_handler)
            });
            this.addEventListener({
                type: "focusout",
                selector: "[data-editableinput]",
                listener: this.editable_focus_out.bind(this, event_handler)
            });
            this.addEventListener({
                type: "keyup",
                selector: "[data-editableinput]",
                listener: this.editable_events_handle.bind(this, event_handler)
            });
            this.addEventListener({
                type: "keydown",
                selector: "[data-editableinput]",
                listener: this.editable_events_handle_keydown.bind(this, event_handler)
            });
        }


        editable_box_click(event_handler: (value: string, event: string, id: string) => void, ev: Event) {
            let element: HTMLElement = <HTMLElement>ev.target;
            let editableInput: HTMLInputElement = document.createElement("input");
            editableInput.classList.add("w3-input");
            editableInput.value = element.innerText;
            editableInput.setAttribute("data-editableevent", element.dataset["editableevent"]);
            editableInput.setAttribute("data-editableid", element.dataset["editableid"]);
            editableInput.setAttribute("data-parentid", element.id);
            editableInput.setAttribute("data-editableinput", "");

            if (element.dataset["editabletype"]) {
                let type: string = element.dataset["editabletype"];
            }

            if (element.dataset["editableplaceholder"]) {
                editableInput.placeholder = element.dataset["editableplaceholder"];
            }
            if (element.dataset["editabletitle"]) {
                editableInput.title = element.dataset["editabletitle"];
            }

            if (element.dataset["editablemin"]) {
                editableInput.setAttribute("min", element.dataset["editablemin"]);
            }

            if (element.dataset["editablestep"]) {
                editableInput.setAttribute("step", element.dataset["editablestep"]);
                editableInput.setAttribute("data-step", element.dataset["editablestep"]);
            }

            if (element.dataset["editabletab"]) {
                editableInput.setAttribute("data-tab", element.dataset["editabletab"]);
            }

            element.parentElement.insertBefore(editableInput, element);
            element.classList.add("w3-hide");
            setTimeout(function () {
                editableInput.focus();
                editableInput.select();
            }, 100);
        }

        editable_events_handle_keydown(event_handler: (value: string, event: string, id: string) => void, ev: KeyboardEvent) {
            let element: HTMLInputElement = <HTMLInputElement>ev.target;
            let text = element.value;
            if (ev.which == 9 || ev.which == 13 || ev.which == 27) {
                element.setAttribute("data-stopfocusout", "true");
            }
            if (ev.which == 9) {
                if (text) {
                    event_handler(text, element.dataset["editableevent"], element.dataset["editableid"]);
                }
                let tabElement: HTMLElement;
                if (element.dataset["tab"]) {
                    tabElement = <HTMLElement>this.root.querySelector(element.dataset["tab"]);
                }
                this.editable_event_close(element);
                if (tabElement) {
                    tabElement.click();
                }
                ev.stopPropagation();
            }
        }

        editable_events_handle(event_handler: (value: string, event: string, id: string) => void, ev: KeyboardEvent) {
            let element: HTMLInputElement = <HTMLInputElement>ev.target;
            let text = element.value;
            if (ev.which == 13) {
                event_handler(text, element.dataset["editableevent"], element.dataset["editableid"]);
                this.editable_event_close(element);
            }
            if (ev.which == 27) {
                this.editable_event_close(element);
            }
        }

        editable_focus_out(event_handler: (value: string, event: string, id: string) => void, ev: Event) {
            let element: HTMLInputElement = <HTMLInputElement>ev.target;
            if (element && element.dataset["stopfocusout"]) {
                return;
            }
            let text = element.value;
            if (text) {
                event_handler(text, element.dataset["editableevent"], element.dataset["editableid"]);
            }
            this.editable_event_close(element);
        }

        editable_event_close(element: HTMLElement) {
            let parentElement: HTMLElement = <HTMLElement>this.root.querySelector("#" + element.dataset["parentid"]);
            element.remove();
            parentElement.classList.remove("w3-hide");
        }

        getElementIndex(element: HTMLElement): number {
            let index: number = 0;
            for (index = 0; index < element.parentNode.childNodes.length; index++) {
                if (element == element.parentNode.childNodes[index]) {
                    break;
                }
            }
            return index;
        }


        order_element_up(ev: Event) {
            let orderElement: HTMLElement = (<HTMLElement>ev.target);
            let id: number = parseInt(orderElement.attributes.getNamedItem("val").value);
            let prefix: string = orderElement.attributes.getNamedItem("order_prefix").value;
            let element: HTMLElement = <HTMLElement>this.root.querySelector(prefix + id);
            var index = this.getElementIndex(element);
            if (index == 0) {
                return;
            }
            element.parentNode.insertBefore(element, element.parentNode.childNodes[index - 1]);
        }

        order_element_down(ev: Event) {
            let orderElement: HTMLElement = (<HTMLElement>ev.target);
            let id: number = parseInt(orderElement.attributes.getNamedItem("val").value);
            let prefix: string = orderElement.attributes.getNamedItem("order_prefix").value;
            let element: HTMLElement = <HTMLElement>this.root.querySelector(prefix + id);
            var index = this.getElementIndex(element);
            if (index == element.parentNode.childNodes.length - 1) {
                return;
            }
            element.parentNode.insertBefore(element, element.parentNode.childNodes[index + 2]);
        }
    }
}

interface IBaseModel {
}

namespace dcore.plugins.mvp_extension {
    export class BaseModel extends dcore.plugins.mvp.Model implements IBaseModel {
        constructor() {
            super();
        }
    }
}

interface DCore {
    useMVPExtended(): void;
    mvpExt: MVPPluginExtension;
}

interface MVPPluginExtension {
    baseView: typeof dcore.plugins.mvp_extension.BaseView
    baseModel: typeof dcore.plugins.mvp_extension.BaseModel
}

namespace dcore {
    "use strict";

    import mvpExtView = plugins.mvp_extension;
    import mvpExtModel = plugins.mvp_extension;

    export interface Instance {
        useMVPExtended(): void;
        mvpExt: MVPPluginExtension;
    }
    Instance.prototype.useMVPExtended = function (): void {
        let that = <DCore>this;
        if (that.mvpExt) {
            return;
        }
        that.mvpExt = {
            baseView: mvpExtView.BaseView,
            baseModel: mvpExtModel.BaseModel
        }
    };
}