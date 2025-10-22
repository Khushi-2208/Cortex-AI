import 'dotenv/config'
import { DataAPIClient } from "@datastax/astra-db-ts";
import { GoogleGenAI } from "@google/genai";
import { PuppeteerWebBaseLoader } from "@langchain/community/document_loaders/web/puppeteer";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { promises as fs } from "fs";


type SimilarityMetric = "dot_product" | "cosine" | "euclidean"


const {ASTRA_DB_KEYSPACE, ASTRA_DB_COLLECTION, ASTRA_DB_API_ENDPOINT, ASTRA_DB_APPLICATION_TOKEN, OPENAI_API_KEY} = process.env

const openai = new GoogleGenAI ({apiKey: OPENAI_API_KEY})

const cortexData = [
    'https://en.wikipedia.org/wiki/Cricket',
    'https://en.wikipedia.org/wiki/Cricket_World_Cup',
    'https://en.wikipedia.org/wiki/Indian_Premier_League',
    'https://www.livesport.com',
    'https://www.cricbuzz.com',
    'https://www.espncricinfo.com',
    'https://www.mykhel.com/cricket/records-stats/#:~:text=Check%20out%20the%20list%20of%20all%20Cricket%20records,best%20averages%2C%20economy%20rates%20and%20more%20on%20myKhel.com.',
    'https://en.wikipedia.org/wiki/Lists_of_cricket_records',
    'https://en.wikipedia.org/wiki/List_of_Cricket_World_Cup_records',
    'https://www.kaggle.com/datasets/bhuvaneshprasad/odi-matches-historical-data-since-1971',
    'https://cricviz.com',
    "https://en.wikipedia.org/wiki/Men%27s_T20_World_Cup",
    "https://en.wikipedia.org/wiki/ICC_Champions_Trophy",
    "https://www.espncricinfo.com/team/india-6/stats",

]

const client = new DataAPIClient(ASTRA_DB_APPLICATION_TOKEN)
const db = client.db(ASTRA_DB_API_ENDPOINT as string, {keyspace: ASTRA_DB_KEYSPACE})
const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 512,
    chunkOverlap: 100
})

const PROGRESS_FILE = "./scripts/processed_urls.json";

// Helper functions to track processed URLs
const loadProcessedUrls = async (): Promise<Set<string>> => {
  try {
    const data = await fs.readFile(PROGRESS_FILE, "utf-8");
    return new Set(JSON.parse(data));
  } catch (error) {
    // File doesn't exist or is invalid, return empty set
    return new Set();
  }
};

const saveProcessedUrl = async (url: string, processedUrls: Set<string>) => {
  processedUrls.add(url);
  await fs.writeFile(
    PROGRESS_FILE,
    JSON.stringify(Array.from(processedUrls), null, 2),
    "utf-8"
  );
};

const createCollection = async (SimilarityMetric: any) => {
    const res = await db.createCollection(ASTRA_DB_COLLECTION as string, {
        vector:{
            dimension: 768,
            metric: SimilarityMetric 
        }
    })
    console.log(res)
}

const loadSampleData = async () => {
    const collection = await db.collection(ASTRA_DB_COLLECTION as string)
    const processedUrls = await loadProcessedUrls();

    console.log(`Found ${processedUrls.size} already processed URLs`);

    for await (const url of cortexData){
        // Skip already processed URLs
        if (processedUrls.has(url)) {
            console.log(`Skipping already processed URL: ${url}`);
            continue;
        }

        console.log(`Processing URL: ${url}`);

        try {
            const content = await scrapePage(url)
            const chunks = await splitter.splitText(content)

            let chunkCount = 0;
            for await (const chunk of chunks){
                try {
                    const embedding = await openai.models.embedContent({
                        model: "gemini-embedding-001",
                        contents: chunk,
                        config: {
                            outputDimensionality: 768
                        }
                    });
                    const vector = embedding.embeddings?.[0].values;
                    const res = await collection.insertOne({
                        $vector: vector,
                        text: chunk
                    })
                    console.log(`Chunk ${++chunkCount}/${chunks.length} inserted:`, res);
                } catch (error: any) {
                    // Check if it's a rate limit error
                    if (
                        error.message?.includes("429") ||
                        error.message?.toLowerCase().includes("rate limit") ||
                        error.message?.toLowerCase().includes("quota") ||
                        error.status === 429
                    ) {
                        console.error(
                            `Rate limit hit while processing ${url} at chunk ${chunkCount + 1}/${chunks.length}`
                        );
                        console.error(
                            "Processed URLs have been saved. Please wait for rate limit to reset and run the script again."
                        );
                        throw error; // Re-throw to stop execution
                    } else {
                        // Log other errors but continue processing
                        console.error(`Error processing chunk: ${error.message}`);
                        continue;
                    }
                }
            }

            // Save progress after successfully processing a URL
            await saveProcessedUrl(url, processedUrls);
            console.log(`✓ Successfully processed and saved: ${url}\n`);
        } catch (error: any) {
            if (
                error.message?.includes("429") ||
                error.message?.toLowerCase().includes("rate limit") ||
                error.message?.toLowerCase().includes("quota") ||
                error.status === 429
            ) {
                // Rate limit error - stop execution
                throw error;
            } else {
                // Log scraping or other errors but continue with next URL
                console.error(`Error processing URL ${url}: ${error.message}`);
                continue;
            }
        }
    }

    console.log("\n✓ All URLs processed successfully!");
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

//createCollection("dot_product").then(() => loadSampleData())
loadSampleData()