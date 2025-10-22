import { GoogleGenerativeAI } from "@google/generative-ai";
import { DataAPIClient } from "@datastax/astra-db-ts";

const {
  ASTRA_DB_KEYSPACE,
  ASTRA_DB_COLLECTION,
  ASTRA_DB_API_ENDPOINT,
  ASTRA_DB_APPLICATION_TOKEN,
  OPENAI_API_KEY
} = process.env;

const genAI = new GoogleGenerativeAI(OPENAI_API_KEY!);

const client = new DataAPIClient(ASTRA_DB_APPLICATION_TOKEN!);
const db = client.db(ASTRA_DB_API_ENDPOINT!, { keyspace: ASTRA_DB_KEYSPACE });

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();
    
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return new Response(
        JSON.stringify({ error: "No messages provided" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const latestMessage = messages[messages.length - 1]?.content;

    if (!latestMessage) {
      return new Response(
        JSON.stringify({ error: "Message content is empty" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    let docContext = "";

    // Generate embedding for vector search
    try {
      const embeddingModel = genAI.getGenerativeModel({ model: "text-embedding-004" });
      const embeddingResult = await embeddingModel.embedContent(latestMessage);
      const embedding = embeddingResult.embedding;

      // Query vector database
      try {
        const collection = await db.collection(ASTRA_DB_COLLECTION!);
        const cursor = collection.find(
          {},
          {
            sort: {
              $vector: embedding.values,
            },
            limit: 10,
          }
        );

        const documents = await cursor.toArray();
        const docsMap = documents?.map((doc) => doc.text);
        docContext = JSON.stringify(docsMap);
      } catch (dbError) {
        console.log("Error querying db:", dbError);
        docContext = "";
      }
    } catch (embeddingError) {
      console.log("Error generating embedding:", embeddingError);
      docContext = "";
    }

    // Create the prompt with context - IMPROVED VERSION
    const prompt = `
You are an AI assistant specializing in Cricket. Answer questions about cricket clearly and helpfully.

IMPORTANT INSTRUCTIONS:
- Always do your best to answer the user's question
- Use the context below when it contains relevant information
- If the context doesn't fully answer the question, use your general cricket knowledge
- Never say "I cannot answer" or "I don't have information" - always provide the best answer you can
- Format responses using markdown where applicable
- Be conversational and helpful

----------------
CONTEXT FROM DATABASE:
${docContext}
----------------

USER QUESTION: ${latestMessage}

Provide a clear, helpful answer:`;

    // Generate streaming response
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });
    const result = await model.generateContentStream(prompt);

    // Create a readable stream for the response
    const encoder = new TextEncoder();
    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of result.stream) {
            const text = chunk.text();
            if (text) {
              controller.enqueue(encoder.encode(text));
            }
          }
          controller.close();
        } catch (streamError) {
          console.error("Stream error:", streamError);
          controller.error(streamError);
        }
      },
    });

    return new Response(readable, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Transfer-Encoding": "chunked",
      },
    });
  } catch (err) {
    console.error("API Route Error:", err);
    return new Response(
      JSON.stringify({ 
        error: "Internal server error",
        details: err instanceof Error ? err.message : "Unknown error"
      }),
      { 
        status: 500, 
        headers: { "Content-Type": "application/json" } 
      }
    );
  }
}