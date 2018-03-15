namespace handlebars_extensions {
    Handlebars.registerHelper('isChecked', function (condition: boolean): string {
        return condition ? "checked" : ""
    });

    Handlebars.registerHelper('isNotChecked', function (condition: boolean): string {
        return !condition ? "checked" : ""
    });

    Handlebars.registerHelper('isCheckedValue', function (currentValue: any, value: any): string {
        return currentValue == value ? "checked" : ""
    });

    Handlebars.registerHelper('isSelected', function (value: any, selectValue: any): string {
        return value == selectValue ? "selected" : ""
    });

    Handlebars.registerHelper('lower', function (value: any, selectValue: any, cssClass: string): string {
        return value < selectValue ? cssClass : ""
    });

    Handlebars.registerHelper('equal', function (value: any, selectValue: any, cssClass: string): string {
        return value == selectValue ? cssClass : ""
    });

    Handlebars.registerHelper('not', function (conditional, options) {
        if (!conditional) {
            return options.fn(this);
        }
        return options.inverse(this);
    });
}