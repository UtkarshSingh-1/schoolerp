const app = require('./src/app');

function printRoutes(stack, prefix = '') {
    stack.forEach(layer => {
        if (layer.route) {
            const methods = Object.keys(layer.route.methods).join(',').toUpperCase();
            console.log(`${methods} ${prefix}${layer.route.path}`);
        } else if (layer.name === 'router') {
            // Handle routers mounted via app.use('/path', router)
            let newPrefix = prefix;
            if (layer.regexp) {
                // This is a very rough way to extract the prefix from the regexp
                // e.g. /^\/api\/?(?=\/|$)/ -> /api
                const match = layer.regexp.source.match(/\\\/(.*?)\\\//);
                if (match) newPrefix += '/' + match[1];
            }
            printRoutes(layer.handle.stack, newPrefix);
        }
    });
}

console.log('--- REGISTERED ROUTES ---');
printRoutes(app._router.stack);
console.log('-------------------------');
