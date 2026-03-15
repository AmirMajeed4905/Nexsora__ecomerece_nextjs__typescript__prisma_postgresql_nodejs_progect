import swaggerJsdoc from "swagger-jsdoc";
import { authDocs } from "../docs/auth.docs";
import { productDocs } from "../docs/product.docs";
import { categoryDocs } from "../docs/category.docs";


const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Nexora API",
      version: "1.0.0",
      description: "Nexora E-Commerce REST API Documentation",
    },
    servers: [
      {
        url: "http://localhost:5000",
        description: "Development server",
      },
    ],
    components: {
      securitySchemes: {
        BearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
    paths: {
      ...authDocs,
      ...productDocs,
        ...categoryDocs,
          

    },
  },
  apis: [],
};

export const swaggerSpec = swaggerJsdoc(options);