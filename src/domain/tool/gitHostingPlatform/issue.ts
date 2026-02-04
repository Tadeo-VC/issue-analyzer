export class Issue {
    private number: number;
    private title: string;
    private body?: string;
    private labels: Label[];
    private createdAt: Date;
    private updatedAt: Date;

    constructor(
        number: number,
        title: string,
        createdAt: Date,
        updatedAt: Date,
        body?: string,
        labels: Label[] = [],
    ) {
        this.number = number;
        this.title = title;
        this.body = body;
        this.labels = labels;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    getTitle(): string {
        return this.title;
    }

    getBody(): string | undefined {
        return this.body;
    }
}

export class Label {
    private name: string;

    constructor(name: string) {
        this.name = name;
    }
}