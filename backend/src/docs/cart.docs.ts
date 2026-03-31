export const cartDocs = {
  "/api/cart": {
    get: {
      summary: "Get current user's cart",
      tags: ["Cart"],
      security: [{ BearerAuth: [] }],
      responses: {
        200: { description: "Cart retrieved successfully" },
        401: { description: "Unauthorized" },
      },
    },
  },
  "/api/cart/add": {
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
              required: ["productId", "quantity"],
              properties: {
                productId: { type: "string", example: "prod_12345" },
                quantity: { type: "number", example: 2 },
              },
            },
          },
        },
      },
      responses: {
        200: { description: "Item added to cart" },
        400: { description: "Not enough stock or stock exceeded" },
        401: { description: "Unauthorized" },
        404: { description: "Product not found" },
      },
    },
  },
  "/api/cart/update": {
    put: {
      summary: "Update cart item quantity",
      tags: ["Cart"],
      security: [{ BearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              required: ["itemId", "quantity"],
              properties: {
                itemId: { type: "string", example: "item_12345" },
                quantity: { type: "number", example: 3 },
              },
            },
          },
        },
      },
      responses: {
        200: { description: "Cart updated" },
        400: { description: "Stock exceeded" },
        401: { description: "Unauthorized" },
        404: { description: "Item not found" },
      },
    },
  },
  "/cart": {
  get: {
    summary: "Get current user's cart",
    description: "Returns the cart and its items for the logged-in user",
    tags: ["Cart"],
    security: [{ BearerAuth: [] }],
    responses: { 200: { description: "Cart retrieved successfully" }, 401: { description: "Unauthorized" } },
  },
},

  "/api/cart/remove/{itemId}": {
    delete: {
      summary: "Remove item from cart",
      tags: ["Cart"],
      security: [{ BearerAuth: [] }],
      parameters: [
        {
          name: "itemId",
          in: "path",
          required: true,
          schema: { type: "string" },
          description: "ID of the cart item to remove",
        },
      ],
      responses: {
        200: { description: "Item removed" },
        401: { description: "Unauthorized" },
        403: { description: "Forbidden" },
        404: { description: "Item not found" },
      },
    },
  },
  "/api/cart/clear": {
    delete: {
      summary: "Clear all items in cart",
      tags: ["Cart"],
      security: [{ BearerAuth: [] }],
      responses: {
        200: { description: "Cart cleared" },
        401: { description: "Unauthorized" },
      },
    },
  },
};