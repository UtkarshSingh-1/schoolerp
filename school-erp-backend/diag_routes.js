const fs = require('fs');
const path = require('path');

const routesDir = path.join(__dirname, 'src', 'routes');
const files = fs.readdirSync(routesDir).filter(f => f.endsWith('.routes.js'));

files.forEach(file => {
    try {
        console.log(`Checking ${file}...`);
        require(path.join(routesDir, file));
        console.log(`Success: ${file}`);
    } catch (err) {
        console.error(`Error in ${file}:`);
        console.error(err);
    }
});
