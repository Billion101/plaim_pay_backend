/**
 * Palm Embedding Decryption Service
 * Updated with correct logic from dd.js
 */

/**
 * Converts a 16-bit half-precision float to 32-bit float
 * This matches the correct implementation from dd.js
 */
function float16ToFloat32(h: number): number {
    // h: unsigned 16-bit int (0..65535)
    const s = (h & 0x8000) >> 15;  // sign bit
    const e = (h & 0x7c00) >> 10;  // exponent
    const f = h & 0x03ff;          // fraction

    // Special cases
    if (e === 0) {
        // subnormal or zero
        if (f === 0) return s ? -0 : 0;
        // subnormal: (-1)^s * 2^-14 * (f/1024)
        return (s ? -1 : 1) * Math.pow(2, -14) * (f / 1024);
    }
    if (e === 0x1f) {
        // Inf / NaN
        return f === 0 ? (s ? -Infinity : Infinity) : NaN;
    }

    // normal: (-1)^s * 2^(e-15) * (1 + f/1024)
    return (s ? -1 : 1) * Math.pow(2, e - 15) * (1 + f / 1024);
}

/**
 * Decrypts a Base64 string into a Float32Array
 * Uses the correct logic from dd.js
 * @param {string} b64String - Base64 encoded palm embedding
 * @returns {Float32Array | null} - Decrypted embedding or null if failed
 */
export function decryptPalmEmbedding(b64String: string): Float32Array | null {
    try {
        console.log('🔍 Decrypting base64 length:', b64String.length);
        console.log('🔍 Base64 preview:', b64String.substring(0, 50) + '...');

        // Clean the base64 string more thoroughly
        let cleanB64 = b64String.trim().replace(/\s/g, '');

        // Remove any non-base64 characters
        cleanB64 = cleanB64.replace(/[^A-Za-z0-9+/=]/g, '');

        // Ensure proper padding
        while (cleanB64.length % 4 !== 0) {
            cleanB64 += '=';
        }

        console.log('🧹 Cleaned base64 length:', cleanB64.length);

        // Try to decode directly without strict validation
        // Base64 can have various valid formats

        // 1) Base64 -> raw bytes
        const raw = Buffer.from(cleanB64, "base64");
        console.log('📦 Raw bytes length:', raw.length);

        // 2) Handle byte length issues
        if (raw.length % 2 !== 0) {
            console.log(`⚠️ Odd byte length: ${raw.length}, fixing by removing last byte...`);
            const fixedRaw = Buffer.from(raw.subarray(0, raw.length - 1));
            console.log('🔧 Fixed length:', fixedRaw.length);
            return decryptFromRawBytes(fixedRaw);
        }

        // Check if we have reasonable amount of data
        if (raw.length < 100) {
            console.error(`❌ Too few bytes: ${raw.length}, expected around 1024`);
            throw new Error(`Insufficient data: ${raw.length} bytes`);
        }

        return decryptFromRawBytes(raw);

    } catch (error) {
        console.error("❌ Error decrypting palm embedding:", error);
        return null;
    }
}

/**
 * Helper function to decrypt from raw bytes
 */
function decryptFromRawBytes(raw: Buffer): Float32Array {
    const count = raw.length / 2;
    console.log('🔢 Float count:', count);

    // 3) Float16 -> Float32 conversion
    const out = new Float32Array(count);
    for (let i = 0; i < count; i++) {
        // Read as little-endian Uint16 (matches Python NumPy default)
        const h = raw.readUInt16LE(i * 2);
        out[i] = float16ToFloat32(h);
    }

    console.log('✅ Decryption successful, length:', out.length);
    console.log('📊 First 10 values:', Array.from(out.slice(0, 10)));

    return out;
}

/**
 * Converts Float32Array to regular JavaScript array for JSON storage
 * @param {Float32Array} float32Array - The decrypted embedding
 * @returns {number[]} - Regular array of numbers
 */
export function float32ArrayToArray(float32Array: Float32Array): number[] {
    return Array.from(float32Array);
}

/**
 * Validates if the decrypted embedding is valid
 * @param {Float32Array | null} embedding - The decrypted embedding
 * @returns {boolean} - True if valid
 */
export function isValidDecryptedEmbedding(embedding: Float32Array | null): boolean {
    if (!embedding) {
        console.error('❌ Embedding is null');
        return false;
    }

    console.log('🔍 Validating embedding length:', embedding.length);

    // Accept any reasonable length (we'll normalize later)
    if (embedding.length < 100) {
        console.error(`❌ Too short: ${embedding.length}, expected at least 100`);
        return false;
    }

    if (embedding.length > 1000) {
        console.error(`❌ Too long: ${embedding.length}, expected max 1000`);
        return false;
    }

    // Check if all values are valid numbers (not NaN or Infinity)
    let invalidCount = 0;
    for (let i = 0; i < Math.min(embedding.length, 100); i++) { // Check first 100 values
        if (!isFinite(embedding[i])) {
            invalidCount++;
        }
    }

    if (invalidCount > 10) { // Allow some invalid values
        console.error(`❌ Too many invalid values: ${invalidCount} in first 100`);
        return false;
    }

    console.log('✅ Embedding validation passed');
    return true;
}

/**
 * Complete decryption and validation process
 * Uses the correct dd.js logic
 * @param {string} b64String - Base64 encoded palm embedding
 * @returns {number[] | null} - Decrypted embedding as array or null if invalid
 */
export function decryptAndValidatePalmEmbedding(b64String: string): number[] | null {
    try {
        console.log('🚀 Starting decryptAndValidatePalmEmbedding...');
        console.log('📥 Input base64 length:', b64String.length);

        // Decrypt the base64 string using correct logic
        const decryptedEmbedding = decryptPalmEmbedding(b64String);

        // Validate the decrypted embedding
        if (!isValidDecryptedEmbedding(decryptedEmbedding)) {
            console.error("❌ Invalid decrypted palm embedding");
            return null;
        }

        // Handle length normalization to 512 values
        let finalEmbedding = decryptedEmbedding!;
        const targetLength = 512;

        if (finalEmbedding.length > targetLength) {
            console.log(`✂️ Truncating embedding from ${finalEmbedding.length} to ${targetLength} values`);
            finalEmbedding = finalEmbedding.slice(0, targetLength);
        } else if (finalEmbedding.length < targetLength) {
            console.log(`📏 Padding embedding from ${finalEmbedding.length} to ${targetLength} values`);
            const padded = new Float32Array(targetLength);
            padded.set(finalEmbedding);
            // Fill remaining with zeros
            for (let i = finalEmbedding.length; i < targetLength; i++) {
                padded[i] = 0;
            }
            finalEmbedding = padded;
        }

        // Convert to regular array for JSON storage
        const result = float32ArrayToArray(finalEmbedding);
        console.log('✅ Final result length:', result.length);
        console.log('📊 First 10 values:', result.slice(0, 10));

        return result;

    } catch (error) {
        console.error("❌ Error in decryptAndValidatePalmEmbedding:", error);
        return null;
    }
}