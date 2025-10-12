import { GoogleGenAI } from "@google/genai";
import { OpenAIStream, StreamingTextResponse } from "ai";
import { DataAPIClient } from "@datastax/astra-db-ts";

const {ASTRA_DB_KEYSPACE, ASTRA_DB_COLLECTION, ASTRA_DB_API_ENDPOINT, ASTRA_DB_APPLICATION_TOKEN, OPENAI_API_KEY} = process.env

const openai = new GoogleGenAI ({apiKey: OPENAI_API_KEY})

const client = new DataAPIClient(ASTRA_DB_APPLICATION_TOKEN)
const db = client.db(ASTRA_DB_API_ENDPOINT, {keyspace: ASTRA_DB_KEYSPACE})

export async POST(req:Request){
    try {
        const {messages} = await req.json();
        const latestMessage = messages[messages?.length - 1]?.content

        let docContext = ""

        const embedding = await openai.models.embedContent({
            model: "embedding-001",
            contents: latestMessage,
        })

        try{
            const collection = await db.collection(ASTRA_DB_COLLECTION)
            collection.find(null, {
                sort: {
                    $vector: embedding.embeddings[0].values,
                },
                limit: 10
            }) 
            
            const documents = await cursor.toArray()

            const docsMap = documents?.map(doc => doc.text)

            docContext = JSON.stringify(docsMap)
        }
         catch (error) {
        console.log("Errorvquerying db...");
        docContext = ""
    }

    const template = {
        role: "system",
        content: `You are an AI assistant who knows everything about Cricket, Badminton, Chess. 
        Use the below context to augment what you know about Cricket, Badminton and Chess.
        The context will provide you with the most recent page data from wikipedia, the official websites and others.
        If the context doesn't include the information you need answer based on existing knowledge and don't mention the source of your information or what the context does or doesn't include.
        Format responses using markdown where applicable and don't return images.
      ----------------
      START CONTEXT
      ${docContext}
      END CONTEXT
      ----------------
      QUESTION: ${latestMessage}
      ---------------- 
        `
    }
    
    //this is for openai
    const response = await openai.chats.completions.create({
        model: "gpt-4",
        stream: true,
        messages: [template, ...messages]
    })
    const stream = OpenAIStream(response)
    return new StreamingTextResponse(stream)
} catch(err){
    throw err
}
}