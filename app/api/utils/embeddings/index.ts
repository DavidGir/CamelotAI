import { HuggingFaceInferenceEmbeddings } from "@langchain/community/embeddings/hf";

// Function to load the embeddings model:
export function loadEmbeddingsModel() {
  return new HuggingFaceInferenceEmbeddings({
    apiKey: process.env.HUGGINGFACEHUB_API_KEY,
    model: "sentence-transformers/all-MiniLM-L6-v2",
  });
}
