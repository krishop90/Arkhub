const crypto = require('crypto');

function generateSignature(urlEndpoint, token, timestamp) {
    const data = urlEndpoint + token + timestamp;
    return crypto.createHash('md5').update(data).digest('hex');
}

function generateSerialNumbers(count) {
    const sns = [];
    for (let i = 0; i < count; i++) {
        const paddedNum = String(i).padStart(3, '0');
        sns.push(`SN-${paddedNum}`);
    }
    return sns;
}

function chunkArray(array, size) {
    const results = [];
    for (let i = 0; i < array.length; i += size) {
        results.push(array.slice(i, i + size));
    }
    return results;
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

module.exports = { generateSignature, generateSerialNumbers, chunkArray, sleep };