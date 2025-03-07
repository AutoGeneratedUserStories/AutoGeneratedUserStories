import axios, { AxiosInstance } from "axios";
import { Number } from "mongoose";

const TRELLO_API_BASE_URL = 'https://api.trello.com/1';

class TrelloService {
    private trelloAxios: AxiosInstance
    private apiKey: string
    private apiToken: string

    constructor(apiKey: string, apiToken: string) {
        this.apiKey = apiKey
        this.apiToken = apiToken
        this.trelloAxios = axios.create({
            baseURL: TRELLO_API_BASE_URL,
            params: {
                key: this.apiKey,
                token: this.apiToken
            }
        })
    }

    public async createBoard(boardName: string): Promise<any> {
        try {
            const response = await this.trelloAxios.post('/boards/', {
                name: boardName,
                defaultLists: false,
            });
            console.log("Board Created:", response.data)
            return response.data
        } catch (error: any) {
            console.error('Error creating board:', error.response.data)
        }
    }

    public async createList(listName: string, idBoard: Number) {
        try {
            const response = await this.trelloAxios.post('/lists/', {
                idBoard: idBoard,
                name: listName,
                defaultLists: false,
            });
            console.log("List Created:", response.data)
            return response.data
        } catch (error: any) {
            console.error('Error creating list:', error.response.data)
        }
    }

    public async CreateChecklist(idCard: number): Promise<any> {
        try {
            const response = await this.trelloAxios.post('/checklist/', {
                idCard: idCard,
                name: "Acceptance Criteria",
                defaultLists: false,
            });
            console.log("Checklist Created:", response.data)
            return response.data
        } catch (error: any) {
            console.error('Error creating list:', error.response.data)
        }
    }

    public async addToChecklist(idChecklist: number, name: string): Promise<any> {
        try {
            const requestString = `/checklist/${idChecklist}/checkItems`
            const response = await this.trelloAxios.post(requestString, {
                idChecklist: idChecklist,
                name: name,
                defaultLists: false,
            });
            console.log("Added to checklist:", response.data)
            return response.data
        } catch (error: any) {
            console.error('Error adding to list:', error.response.data)
        }
    }

    public async createCard(listId: number, cardName: string, cardDesc: string): Promise<any> {
        try {
            const response = await this.trelloAxios.post('/cards', {
                idList: listId,
                name: cardName,
                desc: cardDesc
            })
            console.log("Card Created:", response.data)
            return response.data
        } catch (error: any) {
            console.error('Error creating card:', error.response.data);
        }
    }
}

export default TrelloService;