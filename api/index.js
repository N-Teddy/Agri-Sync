// Wrapper used by Vercel serverless function.
// This file loads the compiled Nest build at runtime (after `pnpm build`).

const path = require('path');

let handler;

async function initHandler() {
    if (handler) return handler;
    // require the compiled handler from dist
    const distHandlerPath = path.join(__dirname, '..', 'dist', 'vercel-handler');
    const mod = require(distHandlerPath);
    // module may export default
    handler = mod.default || mod;
    return handler;
}

module.exports = async (req, res) => {
    const fn = await initHandler();
    try {
        return await fn(req, res);
    } catch (err) {
        // basic error handling
        console.error('Vercel handler error', err);
        res.statusCode = err?.status || 500;
        res.end(err?.message || 'Internal Server Error');
    }
};
