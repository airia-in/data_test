const http = require('http');
const https = require('https');
const url = require('url');

// List of S3 URLs to fetch JSON data from
const s3Urls = [
    'https://airia-dataset.s3.ap-south-1.amazonaws.com/bsData1.json',
    // 'https://airia-dataset.s3.ap-south-1.amazonaws.com/bsData2.json',
    // 'https://airia-dataset.s3.ap-south-1.amazonaws.com/bsData3.json',
    // 'https://airia-dataset.s3.ap-south-1.amazonaws.com/bsData4.json',
    // 'https://airia-dataset.s3.ap-south-1.amazonaws.com/bsData5.json'
];

// Function to fetch data from S3 URL
function fetchDataFromS3(url) {
    return new Promise((resolve, reject) => {
        https.get(url, (res) => {
            let data = '';

            res.on('data', (chunk) => {
                data += chunk;
            });

            res.on('end', () => {
                try {
                    resolve(JSON.parse(data));
                } catch (e) {
                    reject(e);
                }
            });
        }).on('error', (err) => {
            reject(err);
        });
    });
}

// Function to fetch all data from S3 URLs
async function fetchAllDataFromS3() {
    try {
        const dataPromises = s3Urls.map(fetchDataFromS3);
        const allData = await Promise.all(dataPromises);

        // Aggregate all data into a single object
        let aggregatedData = {
            count: 0,
            data: []
        };

        allData.forEach((response) => {
            aggregatedData.count += response.count;
            aggregatedData.data.push(...response.data);
        });

        return aggregatedData;
    } catch (error) {
        throw new Error('Failed to fetch all data from S3: ' + error.message);
    }
}

// Function to get limited data based on limit and offset
function getLimitedData(jsonObject, limit, offset) {
    if (!jsonObject || !jsonObject.data || !Array.isArray(jsonObject.data)) {
        return {
            count: 0,
            data: []
        };
    }

    const data = jsonObject.data.slice(offset, offset + limit);
    return {
        count: jsonObject.count,
        data: data
    };
}

// Create HTTP server
const server = http.createServer(async (req, res) => {
    const parsedUrl = url.parse(req.url, true);
    const pathname = parsedUrl.pathname;

    if (req.method === 'GET' && pathname === '/objects') {
        const limit = parseInt(parsedUrl.query.limit, 10);
        const offset = parseInt(parsedUrl.query.offset, 10);

        if (isNaN(limit) || isNaN(offset)) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Invalid limit or offset' }));
            return;
        }

        try {
            const remoteData = await fetchAllDataFromS3();
            const result = getLimitedData(remoteData, limit, offset);

            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(result));
        } catch (error) {
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Failed to fetch data from S3' }));
        }
    } else {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Not Found' }));
    }
});

// Start server
const PORT = 3000;
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
