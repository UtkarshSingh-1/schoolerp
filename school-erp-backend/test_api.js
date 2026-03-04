const axios = require('axios');

async function testEndpoint() {
    try {
        console.log('Testing GET /api/classes...');
        const res = await axios.get('http://localhost:5000/api/classes');
        console.log('Status:', res.status);
        console.log('Data:', res.data);
    } catch (err) {
        console.log('Error hitting endpoint:', err.message);
        if (err.response) {
            console.log('Status:', err.response.status);
            console.log('Data:', err.response.data);
        }
    }
}

testEndpoint();
