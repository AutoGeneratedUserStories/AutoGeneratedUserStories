
const axios = require('axios');

const TRELLO_API_BASE_URL = 'https://api.trello.com/1'

const TRELLO_API_KEY = ''
const TRELLO_TOKEN = ''

const trelloAxios = axios.create({
    baseURL: TRELLO_API_BASE_URL,
    params: {
        key: TRELLO_API_KEY,
        token: TRELLO_TOKEN
    }
})

export async function createBoard(boardName: string) {
    try {
        const response = await trelloAxios.post('/boards/', {
            name: boardName,
            defaultLists: false,
        });
        console.log("Board Created:", response.data)
        return response.data
    } catch (error: any) {
        console.error('Error creating board:', error.response.data)
    }
}

export async function createCard(listId: number, cardName: string, cardDesc: string) {
    try {
        const response = await trelloAxios.post('/cards', {
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