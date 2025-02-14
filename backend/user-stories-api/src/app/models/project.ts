import { Story } from "./story";

class Project {
    stories: Story[]
    description: string;
    name: string;

    constructor(stories: Story[], description: string, name: string) {
        this.stories = stories;
        this.description = description
        this.name = name;
    }
}

export { Project }