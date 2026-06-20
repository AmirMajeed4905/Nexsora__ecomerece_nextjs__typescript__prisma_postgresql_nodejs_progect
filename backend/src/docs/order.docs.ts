// src/docs/order.docs.ts
export const orderDocs = {
  "/api/orders": {
    post: {
      summary: "Create order from cart",
      tags: ["Orders"],
      security: [{ BearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              required: ["address"],
              properties: {
                address: {
                  type: "object",
                  required: [
                    "fullName",
                    "phone",
                    "street",
                    "city",
                    "state",
                    "postalCode",
                    "country",
                  ],
                  properties: {
                    fullName: { type: "string", example: "Amir Majeed" },
                    phone: { type: "string", example: "+92 300 1234567" },
                    street: { type: "string", example: "123 Main Street" },
                    city: { type: "string", example: "Lahore" },
                    state: { type: "string", example: "Punjab" },
                    postalCode: { type: "string", example: "54000" },
                    country: { type: "string", example: "Pakistan" },
                  },
                },
              },
            },
          },
        },
      },
      responses: {
        201: { description: "Order placed successfully" },
        400: { description: "Cart empty or out of stock" },
      },
    },
    get: {
      summary: "Get my orders",
      tags: ["Orders"],
      security: [{ BearerAuth: [] }],
      responses: {
        200: { description: "Orders fetched" },
      },
    },
  },
  "/api/orders/{id}": {
    get: {
      summary: "Get order by ID",
      tags: ["Orders"],
      security: [{ BearerAuth: [] }],
      parameters: [
        { name: "id", in: "path", required: true, schema: { type: "string" } },
      ],
      responses: {
        200: { description: "Order fetched" },
        404: { description: "Order not found" },
      },
    },
  },
  "/api/orders/{id}/cancel": {
    patch: {
      summary: "Cancel order",
      tags: ["Orders"],
      security: [{ BearerAuth: [] }],
      parameters: [
        { name: "id", in: "path", required: true, schema: { type: "string" } },
      ],
      responses: {
        200: { description: "Order cancelled" },
        400: { description: "Cannot cancel this order" },
      },
    },
  },
  "/api/orders/admin/all": {
    get: {
      summary: "Get all orders — admin only",
      tags: ["Orders"],
      security: [{ BearerAuth: [] }],
      responses: {
        200: { description: "All orders fetched" },
      },
    },
  },
  "/api/orders/admin/{id}/status": {
    patch: {
      summary: "Update order status — admin only",
      tags: ["Orders"],
      security: [{ BearerAuth: [] }],
      parameters: [
        { name: "id", in: "path", required: true, schema: { type: "string" } },
      ],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              required: ["status"],
              properties: {
                status: {
                  type: "string",
                  enum: [
                    "PENDING",
                    "PROCESSING",
                    "SHIPPED",
                    "DELIVERED",
                    "CANCELLED",
                  ],
                  example: "PENDING",
                },
              },
            },
          },
        },
      },
      responses: {
        200: { description: "Status updated" },
        404: { description: "Order not found" },
      },
    },
  },
};