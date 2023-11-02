const client = require(".");

module.exports = {
    caching: (key, data) => {
        client.setEx(key, 10, JSON.stringify(data))
    },
    delCache: (key) => {
        client.del(key)
    }
}