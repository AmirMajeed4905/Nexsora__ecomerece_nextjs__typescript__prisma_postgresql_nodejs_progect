export const categoryDocs = {
  "/api/categories": {
    get: {
      summary: "Get all categories",
      tags: ["Categories"],
      responses: {
        200: { description: "Categories fetched" },
      },
    },
    post: {
      summary: "Create a category — admin only",
      tags: ["Categories"],
      security: [{ BearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          "multipart/form-data": {
            schema: {
              type: "object",
              required: ["name"],
              properties: {
                name: { type: "string", example: "Shoes" },
                image: { type: "string", format: "binary" },
              },
            },
          },
        },
      },
      responses: {
        201: { description: "Category created" },
        400: { description: "Validation error" },
        409: { description: "Category already exists" },
      },
    },
  },

  "/api/categories/{slug}": {
    get: {
      summary: "Get category by slug",
      tags: ["Categories"],
      parameters: [
        { name: "slug", in: "path", required: true, schema: { type: "string" } },
      ],
      responses: {
        200: { description: "Category fetched" },
        404: { description: "Category not found" },
      },
    },
  },

  "/api/categories/{id}": {
    put: {
      summary: "Update a category — admin only",
      tags: ["Categories"],
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
                name: { type: "string", example: "Updated Shoes" },
                image: { type: "string", format: "binary" },
              },
            },
          },
        },
      },
      responses: {
        200: { description: "Category updated" },
        404: { description: "Category not found" },
      },
    },
    delete: {
      summary: "Delete a category — admin only",
      tags: ["Categories"],
      security: [{ BearerAuth: [] }],
      parameters: [
        { name: "id", in: "path", required: true, schema: { type: "string" } },
      ],
      responses: {
        200: { description: "Category deleted" },
        400: { description: "Category has products" },
        404: { description: "Category not found" },
      },
    },
  },
};