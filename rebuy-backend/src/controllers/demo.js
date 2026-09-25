// Routes receive requests → Middleware checks them → Controllers handle them → Services communicate with external systems → Database stores data.

// What should my application do when this API endpoint is called?
// For example:

// POST /api/auth/login

// The route receives the request and sends it to:

// authController.js

// The controller might:

// Get email/password.

// Find the user.

// Check the password.

// Create a JWT.

// Return the JWT.

// --------------------------------------------

// authController.js
// Handles authentication.

// Typical responsibilities:

// Register
// Login
// Logout
// Password-related operations
// Token generation

// For example:

// POST /api/auth/register
// POST /api/auth/login

// might eventually use:

// registerUser()
// loginUser()

// So:

// authController.js = What happens when someone registers or logs in?

// ----------------------------

// userController.js
// Handles operations involving users.

// For example:

// GET /api/users/me
// PUT /api/users/me
// GET /api/users/:id

// It might handle:

// Get profile
// Update profile
// Get user information
// Delete account

// So:

// userController.js = What can users do with their accounts/profile?

// -----------------------------------------

// listingController.js
// A listing is a product/item being offered on your recommerce marketplace.

// For example:

// Used iPhone 15
// Used MacBook Air
// Second-hand bicycle
// Used camera

// This controller could handle:

// Create listing
// Get listings
// Get one listing
// Update listing
// Delete listing

// For example:

// POST   /api/listings
// GET    /api/listings
// GET    /api/listings/:id
// PUT    /api/listings/:id
// DELETE /api/listings/:id

// So:

// listingController.js = What happens when someone creates or manages a product listing?

// orderController.js
// Handles purchases/orders.

// For example:

// Create order
// Get order
// Get user's orders
// Update order status
// Cancel order

// Potential API:

// POST /api/orders
// GET  /api/orders
// GET  /api/orders/:id

// So:

// orderController.js = What happens when someone buys something or manages an order?