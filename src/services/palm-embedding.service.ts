import { decryptAndValidatePalmEmbedding } from './palm-decryption.service';

interface PalmEmbedding {
    embedding: number[];
}

/**
 * Validates if the provided data is a valid palm embedding
 * Supports multiple formats:
 * - Direct array: [0, 1, 2, ...]
 * - Object format: {"embedding": [0, 1, 2, ...]}
 * - Base64 encrypted: "base64string..."
 */
export const validatePalmEmbedding = (data: any): data is PalmEmbedding => {
    if (!data) {
        return false;
    }

    let embeddingArray: number[];

    // Handle base64 encrypted format
    if (typeof data === 'string') {
        const decryptedArray = decryptAndValidatePalmEmbedding(data);
        if (!decryptedArray) {
            return false;
        }
        embeddingArray = decryptedArray;
    }
    // Handle direct array format
    else if (Array.isArray(data)) {
        embeddingArray = data;
    }
    // Handle object format with embedding property
    else if (typeof data === 'object' && data.embedding && Array.isArray(data.embedding)) {
        embeddingArray = data.embedding;
    }
    else {
        return false;
    }

    // Check if array has expected length (512 for palm embeddings)
    if (embeddingArray.length !== 512) {
        return false;
    }

    // Check if all elements are numbers
    return embeddingArray.every((value: any) => typeof value === 'number' && !isNaN(value));
};

/**
 * Calculates cosine similarity between two palm embeddings
 * Returns a value between -1 and 1, where 1 means identical
 */
export const calculateCosineSimilarity = (embedding1: number[], embedding2: number[]): number => {
    if (embedding1.length !== embedding2.length) {
        throw new Error('Embeddings must have the same length');
    }

    let dotProduct = 0;
    let norm1 = 0;
    let norm2 = 0;

    for (let i = 0; i < embedding1.length; i++) {
        dotProduct += embedding1[i] * embedding2[i];
        norm1 += embedding1[i] * embedding1[i];
        norm2 += embedding2[i] * embedding2[i];
    }

    norm1 = Math.sqrt(norm1);
    norm2 = Math.sqrt(norm2);

    if (norm1 === 0 || norm2 === 0) {
        return 0;
    }

    return dotProduct / (norm1 * norm2);
};

/**
 * Checks if two palm embeddings match based on similarity threshold
 * Default threshold is 0.85 (85% similarity)
 * Now works with raw arrays stored in database
 */
export const isPalmMatch = (embedding1: number[], embedding2: number[], threshold: number = 0.85): boolean => {
    const similarity = calculateCosineSimilarity(embedding1, embedding2);
    return similarity >= threshold;
};

/**
 * Generates a unique hash from palm embedding for database indexing
 * This is used for quick lookups before doing similarity calculations
 */
export const generatePalmHash = (embedding: number[]): string => {
    // Create a simplified hash by taking every 10th value and rounding
    const sampledValues = embedding.filter((_, index) => index % 10 === 0).map(val => Math.round(val * 100));
    return sampledValues.join('_');
};

/**
 * Normalizes palm embedding data to standard array format for database storage
 * Converts all formats (direct array, object, and base64) to raw number array
 */
export const normalizePalmEmbedding = (data: any): number[] => {
    if (!data) {
        throw new Error('Invalid palm embedding data');
    }

    let embeddingArray: number[];

    // Handle base64 encrypted format
    if (typeof data === 'string') {
        const decryptedArray = decryptAndValidatePalmEmbedding(data);
        if (!decryptedArray) {
            throw new Error('Failed to decrypt palm embedding');
        }
        embeddingArray = decryptedArray;
    }
    // Handle direct array format
    else if (Array.isArray(data)) {
        embeddingArray = data;
    }
    // Handle object format with embedding property
    else if (typeof data === 'object' && data.embedding && Array.isArray(data.embedding)) {
        embeddingArray = data.embedding;
    }
    else {
        throw new Error('Invalid palm embedding format');
    }

    // Validate the embedding
    if (embeddingArray.length !== 512) {
        throw new Error('Palm embedding must contain exactly 512 values');
    }

    if (!embeddingArray.every((value: any) => typeof value === 'number' && !isNaN(value))) {
        throw new Error('All embedding values must be valid numbers');
    }

    // Return just the array, not wrapped in object
    return embeddingArray.map((val: number) => Number(val));
};