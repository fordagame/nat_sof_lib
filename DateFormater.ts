class DateFormat {
    addZero(value) {
        return value < 10 ? '0' + value : value.toString();
    }

    format(mask: string, date: Date) {
        let getHours: () => number;
        let getDays: () => number;
        let getMonth: () => number;
        let getYear: () => number;
        if (!(<any>date).ignoreTimezone) {
            getHours = date.getHours.bind(date);
            getMonth = date.getMonth.bind(date);
            getYear = date.getFullYear.bind(date);
            getDays = date.getDate.bind(date);
        }
        else {
            getHours = date.getUTCHours.bind(date);
            getMonth = date.getUTCMonth.bind(date);
            getYear = date.getUTCFullYear.bind(date);
            getDays = date.getUTCDate.bind(date);
        }

        switch (mask.toLowerCase()) {
            case 'hh:mm': return this.addZero(getHours()) + ':' + this.addZero(date.getMinutes());
            case 'dd.mm': return this.addZero(getDays()) + '.' + this.addZero(getMonth() + 1);
            case 'dd/mm/yyyy': return this.addZero(getDays()) + '/' + this.addZero(getMonth() + 1) + '/' + getYear();
            case 'dd/mm hh:mm': return this.addZero(getDays()) + '/' + this.addZero(getMonth() + 1) + ' ' + this.addZero(getHours()) + ':' + this.addZero(date.getMinutes());
            case 'mm/dd/yyyy': return this.addZero(date.getMonth() + 1) + '/' + this.addZero(getDays()) + '/' + getYear();
            case 'dd/mm/yyyy hh:mm': return this.addZero(getDays()) + '/' + this.addZero(getMonth() + 1) + '/' + getYear() + " " + this.addZero(getHours()) + ':' + this.addZero(date.getMinutes());
            case 'yyyy-mm-dd hh:mm': return getYear() + '-' + this.addZero(getMonth() + 1) + '-' + this.addZero(getDays()) + " " + this.addZero(getHours()) + ':' + this.addZero(date.getMinutes());
            default: return this.toString();
        }
    }

    static create(dateString: string, ignoreTimezone: boolean = false): Date {
        let date: Date;
        date = new Date(dateString);
        (<any>date).ignoreTimezone = ignoreTimezone;
        return date;
    }
}

let dateFormatter: DateFormat = new DateFormat();

interface Date {
    format(mask: string, utc?: boolean): string;
    addHours(h: number): void;
    create(dateString: string, ignoreTimezone: boolean): Date;
    addOffset(): void;
}

// For convenience...
Date.prototype.format = function (mask, utc) {
    if (this) {
        return dateFormatter.format(mask, this);
    }
    else {
        return "";
    }
};

Date.prototype.addHours = function (h) {
    this.setTime(this.getTime() + (h * 60 * 60 * 1000));
}

Date.prototype.addOffset = function (): void {
    this.setTime(this.getTime() - (this.getTimezoneOffset() * 60 * 1000));
}