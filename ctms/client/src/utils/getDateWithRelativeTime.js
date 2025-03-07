class DateFormatter {
    constructor(dateString) {
        this.dateString = dateString;
        this.taskDate = this.parseDate(dateString);
        this.now = new Date();
        this.diffInMs = this.taskDate ? this.taskDate.getTime() - this.now.getTime() : null;
        this.diffInDays = this.diffInMs ? Math.ceil(this.diffInMs / (1000 * 60 * 60 * 24)) : null;
    }

    parseDate(dateString) {
        if (!dateString) return null;
        const date = new Date(dateString);
        return isNaN(date.getTime()) ? null : date;
    }

    getFormattedDate() {
        if (!this.taskDate) return "Invalid Date";

        return this.taskDate.toLocaleDateString("en-CA", {
            weekday: "short",
            month: "numeric",
            day: "numeric",
            year: "numeric",
        });
    }

    getShort() {
        if (!this.taskDate) return "Invalid Date";

        if (this.diffInDays === 0) return "Today";
        if (this.diffInDays === 1) return "Tomorrow";
        if (this.diffInDays > 1) return `In ${this.diffInDays} days`;
        if (this.diffInDays < 0) return `${Math.abs(this.diffInDays)} days ago`;

        return this.getFormattedDate();
    }

    getLong() {
        if (!this.taskDate) return "Invalid Date";

        const formattedDate = this.getFormattedDate();

        if (this.diffInDays === 0) return `${formattedDate} (Today)`;
        if (this.diffInDays === 1) return `${formattedDate} (Tomorrow)`;
        if (this.diffInDays > 1) return `${formattedDate} (In ${this.diffInDays} days)`;
        if (this.diffInDays < 0) return `${formattedDate} (${Math.abs(this.diffInDays)} days ago)`;

        return formattedDate;
    }
}

const getDateWithRelativeTime = (dateString, format = 'long') => {
    const formatter = new DateFormatter(dateString);
    return format === 'short' ? formatter.getShort() : formatter.getLong();
};

export default getDateWithRelativeTime;