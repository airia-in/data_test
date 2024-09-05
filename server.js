const http = require('http');
const fs = require('fs');
const url = require('url');

// Read data from bsData1.json
const jsonData = JSON.parse(fs.readFileSync('./bsData1.json', 'utf8'));

// Function to get limed data
function getlimedData(jsonObject, lim, offset) {
    const dataArray = jsonObject.data; // Access the array of objects

    // Validate lim and offset
    if (lim < 0 || offset < 0 || offset >= dataArray.length) {
        return { count: jsonObject.count, data: [] };
    }

    // Slice the array to get the limed data
    const limedData = dataArray.slice(offset, offset + lim);
    return { count: jsonObject.count, data: limedData };
}

// Create HTTP server
const server = http.createServer((req, res) => {
    const parsedUrl = url.parse(req.url, true);
    const pathname = parsedUrl.pathname;

    if (req.method === 'GET' && pathname === '/objects') {
        // Get lim and offset from query parameters
        const lim = parseInt(parsedUrl.query.lim, 10);
        const offset = parseInt(parsedUrl.query.offset, 10);

        if (isNaN(lim) || isNaN(offset)) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Invalid lim or offset' }));
            return;
        }

        // Get the limed data
        const result = getlimedData(jsonData, lim, offset);

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
