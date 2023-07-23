import swaggerJSDoc from 'swagger-jsdoc';

const swaggerDefinition = {
    openapi: '3.1.0',
    info: {
        title: 'Breathing AI API',
        version: '1.0.0',
        description: 'API for Breathing AI',
        licence: {
            name: 'MIT',
        },
        contact: {
            name: 'Breathing AI',
            url: 'https://breathing.ai',
            email: ''
        }
    },
    servers: [
        {
            url: 'http://localhost:4000',
            description: 'Development server'
        },
    ],
    apis: ['./src/routes/*.ts', './src/routes/**/*.js'],
};

export const swaggerSpec = swaggerJSDoc(
    {

        swaggerDefinition,
        apis: ['./src/routes/**/*.ts', './src/routes/**/*.js'],
    }
);
