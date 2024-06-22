const http = require('http');
const fs = require('fs');
const url = require('url');

// Read data from 5MB.json
const data = JSON.parse(fs.readFileSync('./bs_1_9_2023_31_05_2024.json', 'utf8'));
const data2 = JSON.parse(fs.readFileSync('./data2.json', 'utf8'));
const final_data = [...data, ...data2]
// Function to get limited data
function getLimitedData(jsonObject, limit, offset) {
    const personArray = jsonObject;

    // Validate limit and offset
    if (limit < 0 || offset < 0 || offset >= personArray.length) {
        return [];
    }

    // Slice the array to get the limited data
    const limitedData = personArray.slice(offset, offset + limit);
    return {"count":personArray.length,"data":limitedData};
}

// Create HTTP server
const server = http.createServer((req, res) => {
    const parsedUrl = url.parse(req.url, true);
    const pathname = parsedUrl.pathname;

    if (req.method === 'GET' && pathname === '/objects') {
        // Get limit and offset from query parameters
        const limit = parseInt(parsedUrl.query.limit, 10);
        const offset = parseInt(parsedUrl.query.offset, 10);

        if (isNaN(limit) || isNaN(offset)) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Invalid limit or offset' }));
            return;
        }

        // Get the limited data
        const result = getLimitedData(final_data, limit, offset);

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(result));
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

