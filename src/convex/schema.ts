import { authTables } from "@convex-dev/auth/server";
import { defineSchema, defineTable } from "convex/server";
import { Infer, v } from "convex/values";

// default user roles. can add / remove based on the project as needed
export const ROLES = {
  ADMIN: "admin",
  USER: "user",
  MEMBER: "member",
} as const;

export const roleValidator = v.union(
  v.literal(ROLES.ADMIN),
  v.literal(ROLES.USER),
  v.literal(ROLES.MEMBER),
);
export type Role = Infer<typeof roleValidator>;

const schema = defineSchema(
  {
    // default auth tables using convex auth.
    ...authTables, // do not remove or modify

    // the users table is the default users table that is brought in by the authTables
    users: defineTable({
      name: v.optional(v.string()), // name of the user. do not remove
      image: v.optional(v.string()), // image of the user. do not remove
      email: v.optional(v.string()), // email of the user. do not remove
      emailVerificationTime: v.optional(v.number()), // email verification time. do not remove
      isAnonymous: v.optional(v.boolean()), // is the user anonymous. do not remove

      role: v.optional(roleValidator), // role of the user. do not remove
    }).index("email", ["email"]), // index for the email. do not remove or modify

    // PawKart product catalog
    products: defineTable({
      sku: v.string(),
      name: v.string(),
      brand: v.string(),
      category: v.string(),
      petType: v.union(v.literal("dog"), v.literal("cat")),
      price: v.number(),
      mrp: v.number(),
      rating: v.number(),
      reviewCount: v.number(),
      stock: v.number(),
      images: v.array(v.string()),
      description: v.string(),
      highlights: v.array(v.string()),
      specs: v.array(v.object({ label: v.string(), value: v.string() })),
      tags: v.array(v.string()),
      badge: v.optional(v.union(v.literal("BESTSELLER"), v.literal("NEW"))),
      isBestseller: v.boolean(),
      isNew: v.boolean(),
      sizes: v.optional(v.array(v.string())),
      createdAt: v.number(),
    })
      .index("by_category", ["category"])
      .index("by_petType", ["petType"])
      .index("by_brand", ["brand"])
      .index("by_bestseller", ["isBestseller"])
      .index("by_new", ["isNew"]),

    // seed bookkeeping so the catalog only loads once
    seedMeta: defineTable({
      key: v.string(),
      version: v.number(),
    }).index("by_key", ["key"]),
  },
  {
    schemaValidation: false,
  },
);

export default schema;
