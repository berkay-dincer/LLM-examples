import { ChatOpenAI } from "@langchain/openai";
import { START, END } from "@langchain/langgraph";
import dotenv from "dotenv";
import { StateGraph, Annotation } from "@langchain/langgraph";

dotenv.config();

// Initialize the LLM
const llm = new ChatOpenAI({
  modelName: "gpt-4o",
  temperature: 0.7,
});

// Define the state schema with proper annotations
const BlogPostState = Annotation.Root({
  topic: Annotation<string>(),
  targetAudience: Annotation<string>(),
  outline: Annotation<string>(),
  draft: Annotation<string>(),
  seoOptimized: Annotation<string>(),
  engagingContent: Annotation<string>(),
  formattedContent: Annotation<string>(),
  quality: Annotation<number>(),
});

// Define node functions

// Generate outline based on topic and audience
async function generateOutline(state: typeof BlogPostState.State) {
  const msg = await llm.invoke(
    `Create a detailed outline for a blog post about "${state.topic}" for ${state.targetAudience}.
     Include 4-6 main sections with bullet points for key talking points in each section.`
  );
  return { outline: msg.content };
}

// Create first draft from outline
async function createDraft(state: typeof BlogPostState.State) {
  const msg = await llm.invoke(
    `Using this outline:

     ${state.outline}

     Write a first draft of a blog post about "${state.topic}" for ${state.targetAudience}.
     Write in a conversational, engaging tone. Aim for around 800-1000 words.`
  );
  return { draft: msg.content };
}

// SEO optimization
async function optimizeForSEO(state: typeof BlogPostState.State) {
  const msg = await llm.invoke(
    `Optimize this blog post draft for SEO:

     ${state.draft}

     1. Add a compelling title with the keyword "${state.topic}"
     2. Include the main keyword ("${state.topic}") naturally throughout the text
     3. Add relevant subheadings (H2, H3) that include secondary keywords
     4. Make sure paragraphs are concise (3-4 sentences)
     5. Add a meta description (150 chars max)`
  );
  return { seoOptimized: msg.content };
}

// Add engaging elements
async function addEngagingElements(state: typeof BlogPostState.State) {
  const msg = await llm.invoke(
    `Enhance this blog post to make it more engaging:

     ${state.seoOptimized}

     1. Add 2-3 relevant statistics or data points with sources
     2. Include 1-2 short examples or case studies
     3. Add a thought-provoking question for readers
     4. Include a call-to-action at the end`
  );
  return { engagingContent: msg.content };
}

// Format with markdown
async function formatContent(state: typeof BlogPostState.State) {
  const msg = await llm.invoke(
    `Format this blog post with proper markdown:

     ${state.engagingContent}

     1. Use # for the title, ## for main sections, ### for subsections
     2. Format lists properly with * or numbers
     3. Use **bold** for important terms and *italics* for emphasis
     4. Add > for blockquotes where appropriate
     5. Make sure there's good spacing between paragraphs`
  );
  return { formattedContent: msg.content };
}

// Quality check gate
function qualityCheck(state: typeof BlogPostState.State) {
  // Calculate quality score based on content characteristics
  let score = 0;

  // Check content length
  if (state.formattedContent.length > 4000){
    score += 3;
  } else if (state.formattedContent.length > 2000) {
    score += 2;
  } else {
    score += 1;
  }

  // Check for markdown formatting
  if (state.formattedContent.includes('#')) score += 1;
  if (state.formattedContent.includes('**') || state.formattedContent.includes('*')) score += 1;
  if (state.formattedContent.includes('>')) score += 1;

  // Check for stats or evidence
  if (state.formattedContent.includes('%') ||
      state.formattedContent.toLowerCase().includes('according to') ||
      state.formattedContent.toLowerCase().includes('research')) {
    score += 2;
  }

  // Return quality score
  return { quality: score };
}

// Quality router
function qualityRouter(state: typeof BlogPostState.State) {
  if (state.quality >= 6) return "High";
  if (state.quality >= 4) return "Medium";
  return "Low";
}

// Path specific improvements for low quality content
async function improveContent(state: typeof BlogPostState.State) {
  const msg = await llm.invoke(
    `This content needs improvement (current quality score: ${state.quality}/8).
     Please enhance this blog post with:

     1. More detailed information and specific examples
     2. Better formatting with proper markdown
     3. At least 2 statistics or data points with sources
     4. A stronger introduction and conclusion
     5. Better subheadings that include keywords

     Content to improve:
     ${state.formattedContent}`
  );
  return {
    formattedContent: msg.content,
    quality: state.quality + 2
  };
}

// Build workflow with the proper TypeScript constructor
const chain = new StateGraph(BlogPostState)
  .addNode("generateOutline", generateOutline)
  .addNode("createDraft", createDraft)
  .addNode("optimizeForSEO", optimizeForSEO)
  .addNode("addEngagingElements", addEngagingElements)
  .addNode("formatContent", formatContent)
  .addNode("qualityCheck", qualityCheck)
  .addNode("improveContent", improveContent)
  .addEdge(START, "generateOutline")
  .addEdge("generateOutline", "createDraft")
  .addEdge("createDraft", "optimizeForSEO")
  .addEdge("optimizeForSEO", "addEngagingElements")
  .addEdge("addEngagingElements", "formatContent")
  .addEdge("formatContent", "qualityCheck")
  .addConditionalEdges(
    "qualityCheck",
    qualityRouter,
    {
      "High": END,
      "Medium": END,
      "Low": "improveContent"
    }
  )
  .addEdge("improveContent", END)
  .compile();

// Execute the workflow
async function runBlogPostGenerator() {
  // Sample inputs
  const topic = "sustainable gardening practices";
  const targetAudience = "homeowners with limited gardening experience";

  console.log(`Generating blog post about "${topic}" for ${targetAudience}...`);

  const state = await chain.invoke({
    topic,
    targetAudience
  });

  console.log("\n=== FINAL BLOG POST ===\n");
  console.log(state.formattedContent);
  console.log("\n=== QUALITY SCORE ===");
  console.log(`${state.quality}/8`);
}

// Run the generator
runBlogPostGenerator().catch(console.error);

// Export for module usage
export { chain, runBlogPostGenerator };