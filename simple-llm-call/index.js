import { ChatOpenAI } from "@langchain/openai";
import { START, END, Graph } from "@langchain/langgraph";
import { HumanMessage } from "@langchain/core/messages";
import dotenv from "dotenv";

dotenv.config();

// Initialize the OpenAI chat model
const llm = new ChatOpenAI({
    openAIApiKey: process.env.OPENAI_API_KEY,
    model: "gpt-4o",
    temperature: 0.8,
});

// LLM call function
const callLLM = async (message) => {
    console.log("Sending request to OpenAI...");

    // Call the model with the message
    const response = await llm.invoke([new HumanMessage(message)]);

    return response;
};

// Create the workflow graph
const workflow = new Graph()
    .addNode("llmNode", callLLM)
    .addEdge(START, "llmNode")
    .addEdge("llmNode", END);

// Compile the runnable workflow
const runnable = workflow.compile();

async function main() {
    if (!process.env.OPENAI_API_KEY) {
        console.error("Error: OPENAI_API_KEY environment variable is not set");
        console.log("Please create a .env file with your OpenAI API key");
        return;
    }

    const input = process.argv[2] || "Tell me a short joke about programming";

    console.log(`User input: "${input}"`);

    try {
        const result = await runnable.invoke(input);

        console.log("\nResponse from OpenAI:");
        console.log(result.content);
    } catch (error) {
        console.error("Error:", error);
        if (error.cause) console.error("Cause:", error.cause);
    }
}

main();