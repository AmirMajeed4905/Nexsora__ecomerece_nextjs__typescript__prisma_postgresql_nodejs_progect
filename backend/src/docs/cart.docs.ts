export const cartDocs = {
  "/api/cart": {
    get: {
      summary: "Get user's cart",
      tags: ["Cart"],
      security: [{ BearerAuth: [] }],
      responses: {
        200: { description: "Cart fetched" },
        401: { description: "Unauthorized" },
      },
    },
    post: {
      summary: "Add item to cart",
      tags: ["Cart"],
      security: [{ BearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              required: ["productId"],
              properties: {
                productId: { type: "string", example: "clx9k2m3p0001" },
                quantity: { type: "number", example: 1 },
              },
            },
          },
        },
      },
      responses: {
        200: { description: "Item added to cart" },
        400: { description: "Validation error or out of stock" },
        404: { description: "Product not found" },
      },
    },
    delete: {
      summary: "Clear cart",
      tags: ["Cart"],
      security: [{ BearerAuth: [] }],
      responses: {
        200: { description: "Cart cleared" },
      },
    },
  },
  "/api/cart/{itemId}": {
    put: {
      summary: "Update cart item quantity",
      tags: ["Cart"],
      security: [{ BearerAuth: [] }],
      parameters: [
        { name: "itemId", in: "path", required: true, schema: { type: "string" } },
      ],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              required: ["quantity"],
              properties: {
                quantity: { type: "number", example: 2 },
              },
            },
          },
        },
      },
      responses: {
        200: { description: "Cart updated" },
        404: { description: "Cart item not found" },
      },
    },
    delete: {
      summary: "Remove item from cart",
      tags: ["Cart"],
      security: [{ BearerAuth: [] }],
      parameters: [
        { name: "itemId", in: "path", required: true, schema: { type: "string" } },
      ],
      responses: {
        200: { description: "Item removed" },
        404: { description: "Cart item not found" },
      },
    },
  },
};