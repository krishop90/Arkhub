const axios = require('axios');
const fs = require('fs');
const config = require('./config');
const { generateSerialNumbers, chunkArray, generateSignature, sleep } = require('./utils');

async function fetchBatch(batch, retryCount = 0) {
    const timestamp = Date.now().toString();
    const signature = generateSignature(config.ENDPOINT, config.TOKEN, timestamp);

    try {
        const response = await axios.post(
            `${config.API_URL}${config.ENDPOINT}`,
            { sn_list: batch },
            {
                headers: {
                    'timestamp': timestamp,
                    'signature': signature,
                    'Content-Type': 'application/json'
                }
            }
        );
        return response.data.data;
    } catch (error) {
        if (error.response && error.response.status === 429) {
            console.warn(`[!] Rate Limit Hit. Retrying in 2s...`);
            await sleep(2000); 
            return fetchBatch(batch, retryCount + 1);
        }
        console.error(`[x] Error: ${error.message}`);
        return [];
    }
}

async function main() {
    console.log("Starting Aggregator...");
    const batches = chunkArray(generateSerialNumbers(config.TOTAL_DEVICES), config.BATCH_SIZE);
    
    const aggregatedResults = [];

    for (let i = 0; i < batches.length; i++) {
        const start = Date.now();
        
        process.stdout.write(`⚡ Batch ${i+1}/${batches.length}... `);
        const data = await fetchBatch(batches[i]);
        aggregatedResults.push(...data);
        
        const duration = Date.now() - start;
        const wait = config.RATE_LIMIT_MS - duration;
        
        if (wait > 0) await sleep(wait);
        process.stdout.write(`Done. (Total: ${aggregatedResults.length})\n`);
    }

    console.log(`\n Complete! Fetched ${aggregatedResults.length} records.`);
    
    fs.writeFileSync('results.json', JSON.stringify(aggregatedResults, null, 2));
    console.log("Saved full list to 'results.json'");
}

main();