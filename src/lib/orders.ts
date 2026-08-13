/**
 * Client-side order model + persistence.
 *
 * Orders are saved server-side through Convex (`src/convex/orders.ts`) and
 * mirrored to localStorage for instant display and offline resilience. When a
 * Node.js/Express + MongoDB backend lands, only `src/services/orders.ts` and
 * this file's mapping change — pages keep their contracts.
 */

export interface OrderItem {
  sku: string;
  name: string;
  qty: number;
  price: number;
  image: string;
}

export interface Order {
  id: string; // human-friendly order number (e.g. "PK12345678")
  items: OrderItem[];
  subtotal: number;
  discount: number;
  deliveryFee: number;
  total: number;
  address: {
    name: string;
    mobile: string;
    line1: string;
    city: string;
    state: string;
    pincode: string;
  };
  paymentMethod: "upi" | "card" | "cod";
  paymentStatus: "paid" | "cod";
  status: string;
  createdAt: string;
}

const ORDERS_KEY = "pawkart:orders:v1";

export function loadOrders(): Order[] {
  try {
    const raw = localStorage.getItem(ORDERS_KEY);
    const parsed = raw ? (JSON.parse(raw) as Order[]) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveOrderToStorage(order: Order) {
  try {
    localStorage.setItem(
      ORDERS_KEY,
      JSON.stringify([order, ...loadOrders()].slice(0, 30)),
    );
  } catch {
    // storage unavailable — the Convex copy still covers it
  }
}

/**
 * Shape of an order document as returned by `api.orders.myOrders`
 * (a Convex Doc<"orders"> with `_id` / `_creationTime` attached).
 */
export interface OrderDoc {
  _id: string;
  _creationTime: number;
  userId: string;
  orderNumber: string;
  items: OrderItem[];
  subtotal: number;
  discount: number;
  deliveryFee: number;
  total: number;
  address: Order["address"];
  paymentMethod: Order["paymentMethod"];
  paymentStatus: Order["paymentStatus"];
  status: string;
  createdAt: string;
}

/** Map a Convex order doc onto the client `Order` shape. */
export function toClientOrder(doc: OrderDoc): Order {
  return {
    id: doc.orderNumber,
    items: doc.items,
    subtotal: doc.subtotal,
    discount: doc.discount,
    deliveryFee: doc.deliveryFee,
    total: doc.total,
    address: doc.address,
    paymentMethod: doc.paymentMethod,
    paymentStatus: doc.paymentStatus,
    status: doc.status,
    createdAt: doc.createdAt,
  };
}
