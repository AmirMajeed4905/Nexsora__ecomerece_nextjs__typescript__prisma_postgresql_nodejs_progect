export const productDocs = {
  "/api/products": {
    get: {
      summary: "Get all products",
      tags: ["Products"],
      responses: {
        200: { description: "Products fetched" },
      },
    },
    post: {
      summary: "Create a product — admin only",
      tags: ["Products"],
      security: [{ BearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          "multipart/form-data": {
            schema: {
              type: "object",
              required: ["name", "description", "price", "categoryId"],
              properties: {
                name: { type: "string", example: "Nike Air Max" },
                description: { type: "string", example: "Premium running shoes" },
                price: { type: "number", example: 129.99 },
                discountPrice: { type: "number", example: 99.99 },
                stock: { type: "number", example: 50 },
                isTrending: { type: "boolean", example: false },
                categoryId: { type: "string", example: "clx9k2m3p0001" },
                images: {
                  type: "array",
                  items: { type: "string", format: "binary" },
                  description: "Max 5 images",
                },
              },
            },
          },
        },
      },
      responses: {
        201: { description: "Product created" },
        400: { description: "Validation error" },
        403: { description: "Forbidden" },
        409: { description: "Product already exists" },
      },
    },
  },

  "/api/products/{slug}": {
    get: {
      summary: "Get product by slug",
      tags: ["Products"],
      parameters: [
        { name: "slug", in: "path", required: true, schema: { type: "string" } },
      ],
      responses: {
        200: { description: "Product fetched" },
        404: { description: "Product not found" },
      },
    },
  },

  "/api/products/{id}": {
    put: {
      summary: "Update a product — admin only",
      tags: ["Products"],
      security: [{ BearerAuth: [] }],
      parameters: [
        { name: "id", in: "path", required: true, schema: { type: "string" } },
      ],
      requestBody: {
        content: {
          "multipart/form-data": {
            schema: {
              type: "object",
              properties: {
                name: { type: "string", example: "Nike Air Max Updated" },
                description: { type: "string" },
                price: { type: "number" },
                discountPrice: { type: "number" },
                stock: { type: "number" },
                isTrending: { type: "boolean" },
                categoryId: { type: "string" },
                images: {
                  type: "array",
                  items: { type: "string", format: "binary" },
                  description: "Max 5 images — replaces existing images",
                },
              },
            },
          },
        },
      },
      responses: {
        200: { description: "Product updated" },
        404: { description: "Product not found" },
        403: { description: "Forbidden" },
      },
    },
    delete: {
      summary: "Delete a product — admin only",
      tags: ["Products"],
      security: [{ BearerAuth: [] }],
      parameters: [
        { name: "id", in: "path", required: true, schema: { type: "string" } },
      ],
      responses: {
        200: { description: "Product deleted" },
        404: { description: "Product not found" },
        403: { description: "Forbidden" },
      },
    },
  },
};