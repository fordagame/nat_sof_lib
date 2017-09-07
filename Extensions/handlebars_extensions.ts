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
    
    Handlebars.registerHelper('not', function (conditional, options) {
        if (!conditional) {
            return options.fn(this);
        }
    });
}