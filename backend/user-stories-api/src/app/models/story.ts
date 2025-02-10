import { List } from "postcss/lib/list";

class Story {
    acceptanceCriteria: string[];
    description: string;
    name: string;

    constructor(name: string, description: string, acceptanceCriteria?: string[]){
        this.name = name;
        this.description = description;
        this.acceptanceCriteria = acceptanceCriteria ?? [];
    }

}


export { Story }