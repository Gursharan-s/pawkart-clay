import { api } from "@/convex/_generated/api";
import { useMutation, useQuery } from "convex/react";

/**
 * PawKart Clay order service — the single swap point when the
 * Node.js/Express + MongoDB backend lands.
 */

/** The signed-in user's orders (Convex docs), null when signed out. */
export function useMyOrders() {
  return useQuery(api.orders.myOrders);
}

/** Persist an order to the user's account. */
export function useSaveOrder() {
  return useMutation(api.orders.saveOrder);
}
