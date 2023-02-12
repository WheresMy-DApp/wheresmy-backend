module.exports = {
    apps: [
        {
            name: "wheresmy",
            script: "dist/index.js",
            instances: 1,
            autorestart: false,
            watch: false,
        },
    ],
};