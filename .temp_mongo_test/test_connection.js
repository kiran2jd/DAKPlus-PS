const { MongoClient } = require('mongodb');
const dotenv = require('dotenv');
const path = require('path');
const https = require('https');

// Load env from parent directory
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const uri = process.env.SPRING_DATA_MONGODB_URI;

if (!uri) {
    console.error("Error: SPRING_DATA_MONGODB_URI not found in .env");
    process.exit(1);
}

// Function to get Public IP
function getPublicIp() {
    return new Promise((resolve, reject) => {
        https.get('https://api.ipify.org?format=json', (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    const json = JSON.parse(data);
                    resolve(json.ip);
                } catch (e) {
                    resolve("Unknown (Could not fetch IP)");
                }
            });
        }).on('error', (err) => {
            resolve("Unknown (Network error checking IP)");
        });
    });
}

const client = new MongoClient(uri, {
    serverSelectionTimeoutMS: 5000,
    connectTimeoutMS: 10000
});

async function run() {
    try {
        const ip = await getPublicIp();
        console.log(`Checking connection from IP: ${ip}`);

        console.log("Attempting to connect to MongoDB Atlas...");
        await client.connect();
        console.log("Successfully connected to MongoDB!");

        const db = client.db('mockanytime');
        const commandResult = await db.command({ ping: 1 });
        console.log("Ping result:", commandResult);

    } catch (err) {
        console.error("CONNECTION FAILED!");
        console.error(err);
    } finally {
        await client.close();
    }
}

run().catch(console.dir);
