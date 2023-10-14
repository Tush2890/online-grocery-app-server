const redis = require('redis');
let client = redis.createClient({
    legacyMode: true,
    disableOfflineQueue: true,
    socket: {
        port: 6379,
        host: '127.0.0.1',
        reconnectStrategy: () => 3000
    }
});
client.on("error", (error) => console.error(`Connection to Redis server failed! Error ${error}`));
client.connect();

module.exports = client;