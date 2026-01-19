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
        // 1) Base64 -> raw bytes
        const raw = Buffer.from(b64String, "base64");

        // 2) Validate byte length (must be even for Float16)
        if (raw.length % 2 !== 0) {
            throw new Error(`Invalid float16 byte length: ${raw.length} (must be even)`);
        }
        const count = raw.length / 2;

        // 3) Float16 -> Float32 conversion
        const out = new Float32Array(count);
        for (let i = 0; i < count; i++) {
            // Read as little-endian Uint16 (matches Python NumPy default)
            const h = raw.readUInt16LE(i * 2);
            out[i] = float16ToFloat32(h);
        }

        return out;
    } catch (error) {
        console.error("Error decrypting palm embedding:", error);
        return null;
    }
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
 * Validates if the decrypted embedding is valid (512 values)
 * @param {Float32Array | null} embedding - The decrypted embedding
 * @returns {boolean} - True if valid
 */
export function isValidDecryptedEmbedding(embedding: Float32Array | null): boolean {
    if (!embedding) {
        return false;
    }

    // Check if it has exactly 512 values
    if (embedding.length !== 512) {
        return false;
    }

    // Check if all values are valid numbers (not NaN or Infinity)
    for (let i = 0; i < embedding.length; i++) {
        if (!isFinite(embedding[i])) {
            return false;
        }
    }

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
        // Decrypt the base64 string using correct logic
        const decryptedEmbedding = decryptPalmEmbedding(b64String);

        // Validate the decrypted embedding
        if (!isValidDecryptedEmbedding(decryptedEmbedding)) {
            console.error("Invalid decrypted palm embedding");
            return null;
        }

        // Convert to regular array for JSON storage
        return float32ArrayToArray(decryptedEmbedding!);

    } catch (error) {
        console.error("Error in decryptAndValidatePalmEmbedding:", error);
        return null;
    }
}