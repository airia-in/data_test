const http = require('http');
const fs = require('fs');
const url = require('url');

// Read data from bsData1.json
const jsonData = JSON.parse(fs.readFileSync('./bsData1.json', 'utf8'));

// Function to get limited data
function getlimitedData(jsonObject, lim, offset) {
    const dataArray = jsonObject.data; // Access the array of objects

    // Validate lim and offset
    if (lim < 0 || offset < 0 || offset >= dataArray.length) {
        return { count: jsonObject.count, data: [] };
    }

    // Slice the array to get the limited data
    const limitedData = dataArray.slice(offset, offset + lim);
    return { count: jsonObject.count, data: limitedData };
}

// Creating HTTP serve
const server = http.createServer((req, res) => {
    const parsedUrl = url.parse(req.url, true);
    const pathname = parsedUrl.pathname;

    if (req.method === 'GET' && pathname === '/objects') {
        // Get lim and offset from query parameters
        const limit = parseInt(parsedUrl.query.limit, 10);
        const offset = parseInt(parsedUrl.query.offset, 10);


        if (isNaN(limit) || limit < 0 || isNaN(offset) || offset < 0) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Invalid limit or offset' }));
            return;
        }

        // Get the limited data
        const result = getlimitedData(jsonData, limit, offset);

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
