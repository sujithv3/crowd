const express = require("express");
const app = express();

const Stripe = require("stripe");

const stripe = new Stripe(
  "sk_test_51MyTbnSHygDnzMTz8wqlnzreImLjrwCfRyWPxjmCEkjS0Kq3TKUXg6P8zOsGNyPIHh4GeGsIwmN2hTw56KdtvUOo00V1GymlYX"
);
