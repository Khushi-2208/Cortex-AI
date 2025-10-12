import { DataAPIClient } from "@datastax/astra-db-ts";
import { GoogleGenAI } from "@google/genai";
import { PuppeteerWebBaseLoader } from "@langchain/community/document_loaders/web/puppeteer";
import "dotenv/config"
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";


type SimilarityMetric = "dot_product" | "cosine" | "euclidean"


const {ASTRA_DB_KEYSPACE, ASTRA_DB_COLLECTION, ASTRA_DB_API_ENDPOINT, ASTRA_DB_APPLICATION_TOKEN, OPENAI_API_KEY} = process.env

const openai = new GoogleGenAI ({apiKey: OPENAI_API_KEY})

const cortexData = [
    'https://en.wikipedia.org/wiki/Cricket',
    'https://en.wikipedia.org/wiki/Cricket_World_Cup',
    'https://en.wikipedia.org/wiki/Indian_Premier_League',
    'https://en.wikipedia.org/wiki/Book',
    'https://en.wikipedia.org/wiki/Literature',
    'https://en.wikipedia.org/wiki/List_of_writing_genres',
    'https://en.wikipedia.org/wiki/Chess',
    'https://en.wikipedia.org/wiki/Chess_opening',
    'https://en.wikipedia.org/wiki/Badminton',
    'https://en.wikipedia.org/wiki/BWF_World_Championships',
    'https://en.wikipedia.org/wiki/BWF_World_Junior_Championships',
    'https://en.wikipedia.org/wiki/Chess_tournament',
    'https://en.wikipedia.org/wiki/Music',
    'https://en.wikipedia.org/wiki/Artificial_intelligence',
    'https://en.wikipedia.org/wiki/List_of_top_book_lists',
    'https://en.wikipedia.org/wiki/List_of_poetry_collections',
    'https://www.bankexamstoday.com/2018/04/list-of-books-released-in-2018.html',
    'https://www.livesport.com'
]

const client = new DataAPIClient(ASTRA_DB_APPLICATION_TOKEN)
const db = client.db(ASTRA_DB_API_ENDPOINT, {keyspace: ASTRA_DB_KEYSPACE})
const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 512,
    chunkOverlap: 100
})

const createCollection = async (SimilarityMetric) => {
    const res = await db.createCollection(ASTRA_DB_COLLECTION, {
        vector:{
            dimension: 768,
            metric: SimilarityMetric 
        }
    })
    console.log(res)
}

const loadSampleData = async () => {
    const collection = await db.collection(ASTRA_DB_COLLECTION)
    for await (const url of cortexData){
        const content = await scrapePage(url)
        const chunks = await splitter.splitText(content)
        try {
            for await (const chunk of chunks){
                const embedding = await openai.models.embedContent({
                    model: "gemini-embedding-001",
                    contents: chunk,
                    config: {
                        outputDimensionality: 768
                    }
                });
               const vector =  embedding.embeddings[0].values;
               const res = await collection.insertOne({
                $vector: vector,
                text: chunk
               })
               console.log(res);
            } 
        } catch (error) {
            console.error("Error inserting chunk",error);
        }  
    }
}

const scrapePage = async (url: string) => {
    const loader = new PuppeteerWebBaseLoader(url, {
        launchOptions: {
            headless: true
        },
        gotoOptions: {
            waitUntil: "domcontentloaded"
        },
        evaluate: async (page, browser) => {
           const result =  await page.evaluate(() => document.body.innerHTML)
           await browser.close()
           return result
        }
    })
    return (await loader.scrape())?.replace(/<[^>]*>?/gm, '|')
}

createCollection("dot_product").then(() => loadSampleData())