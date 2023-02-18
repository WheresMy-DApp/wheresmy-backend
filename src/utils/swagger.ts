import swaggerJSDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

const swaggerDefinition = {
    openapi: '3.0.0',
    info: {
        title: `API for Where's My Network`,
        version: '0.0.2',
        description:
            'REST API for Where\'s My Network',
        license: {
            name: 'Licensed Under MIT',
            url: 'https://spdx.org/licenses/MIT.html',
        },
        contact: {
            name: 'Pranav M S - Dev',
            email: 'dev@wheresmy.network',
        },
    },
    tags: [
        {
            name: 'User',
            description: 'User related endpoints',
        },
        {
            name: 'Device',
            description: 'Device related endpoints',
        },
        {
            name: 'ABI',
            description: 'ABI related endpoints',
        },
        {
            name: 'Health',
            description: 'Getting health of API'
        }
    ],
    servers: [
        {
            url: 'https://api.wheresmy.network',
            description: 'Development server',
        },
    ],
};

const options = {
    swaggerDefinition,
    apis: ['src/docs/health.yaml', 'src/docs/user.yaml', 'src/docs/device.yaml', 'src/docs/abi.yaml'],
};

const swaggerSpec = swaggerJSDoc(options);

export { swaggerUi, swaggerSpec };