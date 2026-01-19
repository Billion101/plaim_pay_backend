// Debug script to analyze the base64 issue

// Test different base64 strings to see what's causing the 753 byte issue

const testStrings = [
    // Working base64 from dd.js (should be 1024 bytes = 512 floats)
    "AACjPBQzwjv/RJE6AABcLbFHAABXOgNEiykrPDQtJTBjRLpAZSkOQYNE8EAZPT04szJjQYo8mSLISAAAjC4AAJVBY0YhIKM7AAAAAEgqgDsSMQAASkRWQVgqKBsAAKk5F0YBRHowLkOpRfA7ZDxrM8c5jkJmPpArzEF7Ngk6AADpQrUoAAAAAFVEAAADLc869UOXQOo4iz45OfYoeztjRik1VEOLPtY4Gi4TKedFykCUPFk6NzFmKCo11j4lPzlAAAD0QUFFRjePQf1CAACgQhQ+iT1TNx8tSzQTRKRAQDivPgI8AAA1PJIi3zK7LykjQjpAQlAxByvlQpw51TnhQDpDAAAPQTZD30JIQQAAAAAAAPFAnT2KQIIrrThJPE0YCz2KN/NGXT7RP4Y8AABBOQRA9Tp7Lg5BahxxRgAAijhKPzU4vT6VOhBHjDu9L6A4vzxXPM44KT0ZRAAAIjc0RF9HKTlsLGw9nEg4Pyck6BVmRII67yAAAOBFRSiTOIBCLETWJmo5SzoAQQAATDQfH9I02jsAAHVCAADJQbIY8TA7NHc05iZxQQAA9SWlLJc/izMZKdki/UdnPGIQkDk4Qww4yR5qL/lFxj1/NhYx8zuHPCNCG0GCPxFCozgBRMcyMD4VQCc9c0h+RpIzIytNRAAAMDQAAIk0nSf4QJ8yvETUPKE+tTbZQhxAAAAAAAAA3z7fMckhOUAAAFw8pj9eLd42w0DqNTE4PT3gPQAA/TKmMiNEKkMYP4QY7ENGGBMwmUTwPAAAMDh3MFtA/0MZNIwaAABJPcY7yEYLJUgnAABPPx1BrjmdNhQ6MT/mEq4m1EgzRgAA7C8AAAAA4USSNyU8zjIJPq8z8kKsNEVAaDwPOMc9DUOQQk1CBEgDOwAAlUAZNTk8/EDtLjw5SkHsQ18980EAAAAAAABIQdJBFSgAALYlRkUAAAFHGDMAAIU5bkEHRl8+UULEPgAAKC3yHdY4NjHaNSIqTDBuLwAAjz1nQU1EfEBFRUU7d0MAAH1I/UIxJENEAjAAANwQuUQAAHc52SW+O002JTwpKNU3LiFrH8QgAACiQdJIRCLEPgAAV0fyGAAAekHdMgAA+DF9QoxBDT1GRDhCAAAAAE0lBzyvPuAd7DsfPRlEBkZsKUA6/ToAAAM5AABQMU4+AACfNA5GMjGoOzA4KjIAAAAApEMCNQAAX0K4M6EusyPEJ6Qdth/4O4lGmjJkPRg9GEPtLFQ2DEDCNhctWDIAAPxFOzdJO3NEhUDLO8g7REIWLvg/kzkAAH1F8zesQmwqCS/GHQ4iBEbsPkQ4KUITLvI2qjcAAAAATkAAAGo1HEALQvE8gDVBOJ4tAACqL0lA+DfFGQ==",
    
    // Your API base64 (might be causing the 753 byte issue)
    "AABHNQAAdDg6Q3Q4sSAAAAREkzMAAJZD3jgxOwZE5jMWQqQ7ED15NYA/sUOTNAImMzYQOHI8ezh0RwAA5CYAAKM8L0RZOM9EAACsJ/M1dDkAAAAAijwmQII2NEIAAL4+/UTZPx4ofDt3RAAA5zkAAGEWoUNeQzYrYEFUOYY6AACaQ8MvsiaiOTBDBhmAMGEze0RIPiU6rj4pJ3glbD6+RAAAkTcbPQg3AAD0KntAXUBaNro6dRwAADs0eyeEQa86AAAnQU0/ZEPbOVc1Fzn/QFQxO0A+ME8tVzavQIhAfyJfOORBAAAuOwAACCGzMAAAAAAyOOcwAAAaNMclRUAaOkBAYDfGOZtBUz/nOfo0ih/iNvg85DyUPaE4GilEMSg5FjK/NxJHNEVTPew7OjKDPYg/Wyj3LWs/8C/jRdUxqDwnQd07eTYkMxxAWD/IOq48FjrjOgMsaTEYQglB9T5jPwtFfzt8MVI4DkaXQZo8AACqRDY2AAB5NCxFSDxYHiU+MT8AAAAARDrYPgAARzWbPNUgVj8AAPtBAADBRAAARDx/MpIZAAAZRH8z+iRNPXo09kBeLwAAR0g7PwolNz1aQQA9ljHDKL5EyELTP5spKD8fOtVB2T3+K+RBFT4IQTssAjwvMiAwaETBRBUorzeDQag0/DG4NNcwYyWRRZMyQEJdO7M9szURQjtBdy0AAAAA9jw3MpAlLEEAAPw8ZUFVLJ8WVUQgPYgnqjaBQAAAUDkAAFxAQkXFPBkoQECvNZwov0WdQgAAazu5Iy08bUDcEwIkAAAsOBI90EN/L/YjAAAORdJDcTJwOa02qTgAAFs3k0heSAAAGh8AAAAAD0csNjBA3jUKPAAA8kIFIqc8/iiMMUg/lkT8RPhCEUdZOAAAEEEmPV44Z0AhLlcoQ0C4QSM/VEUAAJUTri4yOtJBMDQBGkMrYUS8FExDAAAAAABCbkLSRY06wDzTPLsuwj3RKSJEWTo3HwAAHBqlFgAAGkPVONs+6z5nRHg9ZkAAFN9Is0S6JAhGpCnIHAAAM0UAANoiuSz0OCkuujZNJ5UBfzCZJ0QnAAAWRKBFAACIQQAAOUXjKgAADD2cLZg59ES7QmpAlEEUR7E9AAAAAIwuBkP3QHYuoTarPqBA40QsOF0tzzhoMMc2AADNL5I/AADdN3RHMDVPMY4hZD4AAAAAHkOGLwAA/jpCKEQ79TTGJMEfzintQM1FFURKPUQ0+0HXJgg4ukAFJfwlAAAAAGFBAAAAAFBEbkSaOaMvqT/KJNQ8LC04M/hHajaZPd87AAAAAAAAiUYmQbEvAT/IJ100vDylNQAAREQAAH44+jt1PTI4AAD8LqE/1ipVNc48UTRvMg=="
];

console.log('🔍 Base64 Analysis');
console.log('==================');

testStrings.forEach((b64, index) => {
    console.log(`\n📊 String ${index + 1}:`);
    console.log('Base64 length:', b64.length);
    
    try {
        // Clean the string
        const cleaned = b64.trim().replace(/\s/g, '');
        console.log('Cleaned length:', cleaned.length);
        
        // Decode to bytes
        const raw = Buffer.from(cleaned, 'base64');
        console.log('Raw bytes:', raw.length);
        console.log('Is even?', raw.length % 2 === 0);
        console.log('Float count:', raw.length / 2);
        
        if (raw.length % 2 === 0) {
            console.log('✅ Valid for Float16 decoding');
        } else {
            console.log('❌ Invalid - odd byte count');
            console.log('🔧 Would need', raw.length + 1, 'bytes to be even');
        }
        
    } catch (error) {
        console.log('❌ Error decoding:', error.message);
    }
});

console.log('\n💡 Solutions for 753-byte issue:');
console.log('1. Check if base64 is truncated during transmission');
console.log('2. Verify the original encoding process');
console.log('3. Use a different base64 string that decodes to even bytes');
console.log('4. The backend now has auto-fix for 1025-byte case (512*2+1)');

console.log('\n🎯 Recommendation:');
console.log('Use the working base64 from dd.js for testing:');
console.log('Length should be 1024 bytes (512 floats)');