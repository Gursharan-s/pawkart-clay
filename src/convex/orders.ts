import { getAuthUserId } from "@convex-dev/auth/server";
import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

/**
 * PawKart Clay orders API.
 *
 * Orders are stored server-side and scoped to the signed-in user, so order
 * history follows the account across devices. The client keeps a localStorage
 * mirror (`src/lib/orders.ts`) for instant display and offline resilience.
 */

const orderItemValidator = v.object({
  sku: v.string(),
  name: v.string(),
  qty: v.number(),
  price: v.number(),
  image: v.string(),
});

const addressValidator = v.object({
  name: v.string(),
  mobile: v.string(),
  line1: v.string(),
  city: v.string(),
  state: v.string(),
  pincode: v.string(),
});

export const saveOrder = mutation({
  args: {
    items: v.array(orderItemValidator),
    subtotal: v.number(),
    discount: v.number(),
    deliveryFee: v.number(),
    total: v.number(),
    address: addressValidator,
    paymentMethod: v.union(
      v.literal("upi"),
      v.literal("card"),
      v.literal("cod"),
    ),
    paymentStatus: v.union(v.literal("paid"), v.literal("cod")),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) {
      throw new Error("Sign in to place an order.");
    }

    const orderNumber = `PK${Date.now().toString().slice(-8)}`;
    const id = await ctx.db.insert("orders", {
      userId,
      orderNumber,
      ...args,
      status: "Order Placed",
      createdAt: new Date().toISOString(),
    });

    return { id, orderNumber };
  },
});

/** The current user's orders, newest first. Returns null when signed out. */
export const myOrders = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) {
      return null;
    }
    return await ctx.db
      .query("orders")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .order("desc")
      .collect();
  },
});
