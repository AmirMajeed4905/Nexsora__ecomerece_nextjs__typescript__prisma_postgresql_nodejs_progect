export const authDocs = {
  "/api/auth/register": {
    post: {
      summary: "Register a new user",
      tags: ["Auth"],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              required: ["name", "email", "password"],
              properties: {
                name: { type: "string", example: "Amir Majeed" },
                email: { type: "string", example: "amir@nexora.com" },
                password: { type: "string", example: "Test1234" },
              },
            },
          },
        },
      },
      responses: {
        201: { description: "Account created successfully" },
        400: { description: "Validation error" },
        409: { description: "Email already registered" },
      },
    },
  },
  "/api/auth/login": {
    post: {
      summary: "Login with email and password",
      tags: ["Auth"],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              required: ["email", "password"],
              properties: {
                email: { type: "string", example: "amir@nexora.com" },
                password: { type: "string", example: "Test1234" },
              },
            },
          },
        },
      },
      responses: {
        200: { description: "Login successful" },
        401: { description: "Invalid email or password" },
      },
    },
  },
  "/api/auth/refresh": {
    post: {
      summary: "Get new access token using refresh token cookie",
      tags: ["Auth"],
      responses: {
        200: { description: "Token refreshed" },
        401: { description: "Invalid or expired refresh token" },
      },
    },
  },
  "/api/auth/logout": {
    post: {
      summary: "Logout — clears refresh token",
      tags: ["Auth"],
      security: [{ BearerAuth: [] }],
      responses: {
        200: { description: "Logged out successfully" },
        401: { description: "Unauthorized" },
      },
    },
  },
  "/api/auth/me": {
    get: {
      summary: "Get currently logged-in user",
      tags: ["Auth"],
      security: [{ BearerAuth: [] }],
      responses: {
        200: { description: "User fetched" },
        401: { description: "Unauthorized" },
      },
    },
  },
};