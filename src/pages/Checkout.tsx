import { useCart } from "@/context";
import { formatINR } from "@/lib/format";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  Banknote,
  Check,
  CreditCard,
  Loader2,
  MapPin,
  PartyPopper,
  Smartphone,
  Truck,
} from "lucide-react";
import { useMemo, useState } from "react";
import { Link } from "react-router";
import { toast } from "sonner";

export interface OrderItem {
  sku: string;
  name: string;
  qty: number;
  price: number;
  image: string;
}

export interface Order {
  id: string;
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
  status: "Order Placed";
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

export function saveOrder(order: Order) {
  try {
    localStorage.setItem(
      ORDERS_KEY,
      JSON.stringify([order, ...loadOrders()].slice(0, 30)),
    );
  } catch {
    // ignore
  }
}

const INDIAN_STATES = [
  "Andhra Pradesh", "Assam", "Bihar", "Chhattisgarh", "Delhi", "Goa",
  "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka",
  "Kerala", "Madhya Pradesh", "Maharashtra", "Odisha", "Punjab",
  "Rajasthan", "Tamil Nadu", "Telangana", "Uttar Pradesh", "Uttarakhand",
  "West Bengal",
];

type Step = "address" | "delivery" | "payment" | "confirm";

const EMPTY_ADDRESS = {
  name: "",
  mobile: "",
  line1: "",
  city: "",
  state: "",
  pincode: "",
};

export default function Checkout() {
  const { items, subtotal, discount, deliveryFee, total, clear } = useCart();
  const { user } = useAuth();

  const [step, setStep] = useState<Step>("address");
  const [address, setAddress] = useState(EMPTY_ADDRESS);
  const [deliveryMode, setDeliveryMode] = useState<"standard" | "express">("standard");
  const [payment, setPayment] = useState<"upi" | "card" | "cod">("upi");
  const [placing, setPlacing] = useState(false);
  const [placedOrder, setPlacedOrder] = useState<Order | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const effectiveFee =
    deliveryMode === "express" ? Math.max(deliveryFee, 99) : deliveryFee;
  const effectiveTotal = subtotal - discount + effectiveFee;

  const summary = useMemo(
    () => ({
      subtotal,
      discount,
      deliveryFee: effectiveFee,
      total: effectiveTotal,
    }),
    [subtotal, discount, effectiveFee, effectiveTotal],
  );

  const validateAddress = () => {
    const errs: Record<string, string> = {};
    if (address.name.trim().length < 3) errs.name = "Enter your full name";
    if (!/^[6-9]\d{9}$/.test(address.mobile.trim()))
      errs.mobile = "Enter a valid 10-digit mobile number";
    if (address.line1.trim().length < 5) errs.line1 = "Enter your house/street";
    if (address.city.trim().length < 2) errs.city = "Enter your city";
    if (!address.state) errs.state = "Select your state";
    if (!/^[1-9]\d{5}$/.test(address.pincode.trim()))
      errs.pincode = "Enter a valid 6-digit pincode";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const placeOrder = () => {
    setPlacing(true);
    // Simulated payment gateway — swap with Razorpay order API here.
    setTimeout(() => {
      const order: Order = {
        id: `PK${Date.now().toString().slice(-8)}`,
        items: items.map((i) => ({
          sku: i.sku,
          name: i.name,
          qty: i.qty,
          price: i.price,
          image: i.image,
        })),
        ...summary,
        address: {
          name: address.name.trim(),
          mobile: address.mobile.trim(),
          line1: address.line1.trim(),
          city: address.city.trim(),
          state: address.state,
          pincode: address.pincode.trim(),
        },
        paymentMethod: payment,
        paymentStatus: payment === "cod" ? "cod" : "paid",
        status: "Order Placed",
        createdAt: new Date().toISOString(),
      };
      saveOrder(order);
      setPlacedOrder(order);
      setStep("confirm");
      clear();
      setPlacing(false);
      toast.success("Order placed successfully! 🎉");
    }, 1400);
  };

  const next = () => {
    if (step === "address") {
      if (!validateAddress()) {
        toast.error("Please fix the highlighted fields");
        return;
      }
      setStep("delivery");
    } else if (step === "delivery") {
      setStep("payment");
    } else if (step === "payment") {
      placeOrder();
    }
  };

  const back = () => {
    if (step === "delivery") setStep("address");
    else if (step === "payment") setStep("delivery");
  };

  const inputCls = (field: string) =>
    cn(
      "h-11 w-full rounded-2xl border bg-white px-3.5 text-sm font-semibold text-clay-ink placeholder:text-clay-ink/35 focus:border-clay-orange focus:outline-none focus:ring-2 focus:ring-clay-orange/20",
      errors[field] ? "border-rose-400" : "border-clay-ink/10",
    );

  if (placedOrder) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center">
        <motion.div
          initial={{ scale: 0.6, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 260, damping: 18 }}
          className="mx-auto flex size-20 items-center justify-center rounded-full bg-clay-mint text-clay-green clay-surface"
        >
          <PartyPopper className="size-9" />
        </motion.div>
        <h1 className="font-display mt-6 text-3xl font-bold text-clay-ink">
          Order confirmed! 🎉
        </h1>
        <p className="mt-2 text-sm text-clay-ink/60">
          Thank you, {placedOrder.address.name.split(" ")[0]}. Your order{" "}
          <span className="font-extrabold text-clay-orange">
            {placedOrder.id}
          </span>{" "}
          has been placed and a confirmation has been sent.
        </p>

        <div className="mt-8 rounded-[1.75rem] border border-clay-ink/5 bg-card p-6 text-left clay-surface">
          <div className="space-y-3">
            {placedOrder.items.map((item) => (
              <div key={item.sku} className="flex items-center gap-3">
                <img
                  src={item.image}
                  alt={item.name}
                  className="size-12 rounded-xl object-cover"
                />
                <p className="flex-1 truncate text-sm font-bold text-clay-ink">
                  {item.name} <span className="text-clay-ink/40">× {item.qty}</span>
                </p>
                <p className="text-sm font-extrabold text-clay-ink">
                  {formatINR(item.price * item.qty)}
                </p>
              </div>
            ))}
          </div>
          <div className="mt-4 flex justify-between border-t border-clay-ink/8 pt-3 text-base font-extrabold text-clay-ink">
            <span>Total paid</span>
            <span>{formatINR(placedOrder.total)}</span>
          </div>
          <p className="mt-1 text-right text-xs font-semibold text-clay-ink/45">
            Payment: {placedOrder.paymentMethod.toUpperCase()} ·{" "}
            {placedOrder.paymentStatus === "paid" ? "Paid" : "Pay on delivery"}
          </p>
        </div>

        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link
            to="/account?tab=orders"
            className="clay-btn h-12 rounded-2xl bg-clay-ink px-6 text-sm font-extrabold text-white"
          >
            Track order
          </Link>
          <Link
            to="/products"
            className="clay-btn h-12 rounded-2xl bg-clay-orange px-6 text-sm font-extrabold text-white"
          >
            Continue shopping
          </Link>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-center px-4 py-24 text-center">
        <span className="text-6xl">🧾</span>
        <h1 className="font-display mt-5 text-2xl font-bold text-clay-ink">
          Nothing to check out
        </h1>
        <p className="mt-2 text-sm text-clay-ink/55">
          Your cart is empty. Add a few goodies first!
        </p>
        <Link
          to="/products"
          className="clay-btn mt-6 h-12 rounded-2xl bg-clay-orange px-7 text-sm font-extrabold text-white"
        >
          Browse products
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:py-10">
      <h1 className="font-display text-2xl font-bold text-clay-ink sm:text-3xl">
        Checkout
      </h1>

      {/* Stepper */}
      <ol className="mt-6 flex items-center gap-2 text-xs font-extrabold">
        {(
          [
            ["address", "Address"],
            ["delivery", "Delivery"],
            ["payment", "Payment"],
            ["confirm", "Confirmation"],
          ] as [Step, string][]
        ).map(([key, label], i) => {
          const order = ["address", "delivery", "payment", "confirm"];
          const idx = order.indexOf(step);
          const done = order.indexOf(key) < idx;
          const active = order.indexOf(key) === idx;
          return (
            <li key={key} className="flex flex-1 items-center gap-2">
              <span
                className={cn(
                  "flex size-7 shrink-0 items-center justify-center rounded-full text-[11px] transition-colors",
                  active
                    ? "bg-clay-orange text-white"
                    : done
                      ? "bg-clay-green text-white"
                      : "bg-clay-sand text-clay-ink/45",
                )}
              >
                {done ? <Check className="size-3.5" /> : i + 1}
              </span>
              <span
                className={cn(
                  "hidden sm:inline",
                  active ? "text-clay-ink" : "text-clay-ink/40",
                )}
              >
                {label}
              </span>
              {i < 3 && <span className="h-px flex-1 bg-clay-ink/10" />}
            </li>
          );
        })}
      </ol>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_340px]">
        <div className="rounded-[1.75rem] border border-clay-ink/5 bg-card p-6 clay-tile">
          <AnimatePresence mode="wait">
            {/* Address */}
            {step === "address" && (
              <motion.div
                key="address"
                initial={{ opacity: 0, x: 16 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -16 }}
                transition={{ duration: 0.2 }}
              >
                <h2 className="flex items-center gap-2 font-display text-lg font-bold text-clay-ink">
                  <MapPin className="size-4.5 text-clay-orange" /> Delivery address
                </h2>
                <div className="mt-5 grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1.5 block text-xs font-extrabold text-clay-ink/60">Full name</label>
                    <input
                      value={address.name}
                      onChange={(e) => setAddress({ ...address, name: e.target.value })}
                      placeholder="Riya Kapoor"
                      className={inputCls("name")}
                    />
                    {errors.name && <p className="mt-1 text-[11px] font-semibold text-rose-500">{errors.name}</p>}
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs font-extrabold text-clay-ink/60">Mobile number</label>
                    <input
                      value={address.mobile}
                      onChange={(e) => setAddress({ ...address, mobile: e.target.value.replace(/\D/g, "").slice(0, 10) })}
                      placeholder="98765 43210"
                      inputMode="numeric"
                      className={inputCls("mobile")}
                    />
                    {errors.mobile && <p className="mt-1 text-[11px] font-semibold text-rose-500">{errors.mobile}</p>}
                  </div>
                  <div className="sm:col-span-2">
                    <label className="mb-1.5 block text-xs font-extrabold text-clay-ink/60">House / Flat / Street</label>
                    <input
                      value={address.line1}
                      onChange={(e) => setAddress({ ...address, line1: e.target.value })}
                      placeholder="Flat 302, Sunrise Apartments, MG Road"
                      className={inputCls("line1")}
                    />
                    {errors.line1 && <p className="mt-1 text-[11px] font-semibold text-rose-500">{errors.line1}</p>}
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs font-extrabold text-clay-ink/60">City</label>
                    <input
                      value={address.city}
                      onChange={(e) => setAddress({ ...address, city: e.target.value })}
                      placeholder="Bengaluru"
                      className={inputCls("city")}
                    />
                    {errors.city && <p className="mt-1 text-[11px] font-semibold text-rose-500">{errors.city}</p>}
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs font-extrabold text-clay-ink/60">Pincode</label>
                    <input
                      value={address.pincode}
                      onChange={(e) => setAddress({ ...address, pincode: e.target.value.replace(/\D/g, "").slice(0, 6) })}
                      placeholder="560001"
                      inputMode="numeric"
                      className={inputCls("pincode")}
                    />
                    {errors.pincode && <p className="mt-1 text-[11px] font-semibold text-rose-500">{errors.pincode}</p>}
                  </div>
                  <div className="sm:col-span-2">
                    <label className="mb-1.5 block text-xs font-extrabold text-clay-ink/60">State</label>
                    <select
                      value={address.state}
                      onChange={(e) => setAddress({ ...address, state: e.target.value })}
                      className={cn(inputCls("state"), address.state ? "text-clay-ink" : "text-clay-ink/35")}
                    >
                      <option value="">Select state</option>
                      {INDIAN_STATES.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                    {errors.state && <p className="mt-1 text-[11px] font-semibold text-rose-500">{errors.state}</p>}
                  </div>
                </div>
              </motion.div>
            )}

            {/* Delivery */}
            {step === "delivery" && (
              <motion.div
                key="delivery"
                initial={{ opacity: 0, x: 16 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -16 }}
                transition={{ duration: 0.2 }}
              >
                <h2 className="flex items-center gap-2 font-display text-lg font-bold text-clay-ink">
                  <Truck className="size-4.5 text-clay-orange" /> Delivery method
                </h2>
                <div className="mt-5 grid gap-4 sm:grid-cols-2">
                  <DeliveryOption
                    active={deliveryMode === "standard"}
                    onClick={() => setDeliveryMode("standard")}
                    icon={<Truck className="size-5" />}
                    title="Standard Delivery"
                    desc="3-5 working days"
                    fee={deliveryFee === 0 ? "FREE" : formatINR(deliveryFee)}
                  />
                  <DeliveryOption
                    active={deliveryMode === "express"}
                    onClick={() => setDeliveryMode("express")}
                    icon={<Truck className="size-5" />}
                    title="Express Delivery"
                    desc="1-2 working days"
                    fee={formatINR(Math.max(deliveryFee, 99))}
                  />
                </div>
              </motion.div>
            )}

            {/* Payment */}
            {step === "payment" && (
              <motion.div
                key="payment"
                initial={{ opacity: 0, x: 16 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -16 }}
                transition={{ duration: 0.2 }}
              >
                <h2 className="flex items-center gap-2 font-display text-lg font-bold text-clay-ink">
                  <Banknote className="size-4.5 text-clay-orange" /> Payment method
                </h2>
                <p className="mt-1 text-xs font-semibold text-clay-ink/45">
                  Payments are simulated for this preview — Razorpay integration
                  slots in here.
                </p>
                <div className="mt-5 grid gap-3">
                  <PaymentOption
                    active={payment === "upi"}
                    onClick={() => setPayment("upi")}
                    icon={<Smartphone className="size-5" />}
                    title="UPI"
                    desc="GPay, PhonePe, Paytm & more"
                  />
                  <PaymentOption
                    active={payment === "card"}
                    onClick={() => setPayment("card")}
                    icon={<CreditCard className="size-5" />}
                    title="Credit / Debit Card"
                    desc="Visa, Mastercard, RuPay"
                  />
                  <PaymentOption
                    active={payment === "cod"}
                    onClick={() => setPayment("cod")}
                    icon={<Banknote className="size-5" />}
                    title="Cash on Delivery"
                    desc="Pay in cash when your order arrives"
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Stepper actions */}
          <div className="mt-8 flex items-center justify-between">
            {step !== "address" ? (
              <button
                type="button"
                onClick={back}
                className="inline-flex items-center gap-1.5 rounded-2xl px-4 py-2.5 text-sm font-extrabold text-clay-ink/60 transition-colors hover:text-clay-ink"
              >
                <ArrowLeft className="size-4" /> Back
              </button>
            ) : (
              <span />
            )}
            <button
              type="button"
              onClick={next}
              disabled={placing}
              className="clay-btn h-12 rounded-2xl bg-clay-orange px-7 text-sm font-extrabold text-white disabled:opacity-60"
            >
              {placing ? (
                <>
                  <Loader2 className="size-4 animate-spin" /> Placing order…
                </>
              ) : step === "payment" ? (
                "Place Order"
              ) : (
                <>
                  Continue <ArrowRight className="size-4" />
                </>
              )}
            </button>
          </div>
        </div>

        {/* Summary sidebar */}
        <aside className="h-fit rounded-[1.75rem] border border-clay-ink/5 bg-card p-6 clay-surface">
          <h2 className="font-display text-lg font-bold text-clay-ink">Summary</h2>
          <div className="mt-4 max-h-56 space-y-3 overflow-y-auto pr-1">
            {items.map((item) => (
              <div key={item.sku} className="flex items-center gap-3">
                <img
                  src={item.image}
                  alt={item.name}
                  className="size-11 rounded-xl object-cover"
                />
                <p className="min-w-0 flex-1 truncate text-xs font-bold text-clay-ink">
                  {item.name}
                  <span className="block text-[10px] font-semibold text-clay-ink/45">
                    × {item.qty}
                  </span>
                </p>
                <p className="text-xs font-extrabold text-clay-ink">
                  {formatINR(item.price * item.qty)}
                </p>
              </div>
            ))}
          </div>
          <dl className="mt-4 space-y-2 border-t border-clay-ink/8 pt-4 text-sm">
            <div className="flex justify-between font-semibold text-clay-ink/70">
              <dt>Subtotal</dt>
              <dd>{formatINR(subtotal)}</dd>
            </div>
            {discount > 0 && (
              <div className="flex justify-between font-semibold text-clay-green">
                <dt>Discount</dt>
                <dd>− {formatINR(discount)}</dd>
              </div>
            )}
            <div className="flex justify-between font-semibold text-clay-ink/70">
              <dt>Delivery</dt>
              <dd>
                {deliveryMode === "express"
                  ? formatINR(Math.max(deliveryFee, 99))
                  : deliveryFee === 0
                    ? "FREE"
                    : formatINR(deliveryFee)}
              </dd>
            </div>
            <div className="flex justify-between border-t border-clay-ink/8 pt-3 text-base font-extrabold text-clay-ink">
              <dt>Total</dt>
              <dd>{formatINR(effectiveTotal)}</dd>
            </div>
          </dl>
          {user?.email && (
            <p className="mt-3 text-[11px] font-semibold text-clay-ink/40">
              Checking out as {user.email}
            </p>
          )}
        </aside>
      </div>
    </div>
  );
}

function DeliveryOption({
  active,
  onClick,
  icon,
  title,
  desc,
  fee,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  title: string;
  desc: string;
  fee: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex items-center gap-3 rounded-2xl border-2 p-4 text-left transition-all",
        active
          ? "border-clay-orange bg-clay-blush/40"
          : "border-clay-ink/10 bg-white hover:border-clay-orange/40",
      )}
    >
      <span
        className={cn(
          "flex size-11 shrink-0 items-center justify-center rounded-2xl",
          active ? "bg-clay-orange text-white" : "bg-clay-sand text-clay-ink/60",
        )}
      >
        {icon}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-extrabold text-clay-ink">{title}</span>
        <span className="block text-xs font-semibold text-clay-ink/50">{desc}</span>
      </span>
      <span className="text-sm font-extrabold text-clay-orange">{fee}</span>
    </button>
  );
}

function PaymentOption({
  active,
  onClick,
  icon,
  title,
  desc,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  title: string;
  desc: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex items-center gap-3 rounded-2xl border-2 p-4 text-left transition-all",
        active
          ? "border-clay-orange bg-clay-blush/40"
          : "border-clay-ink/10 bg-white hover:border-clay-orange/40",
      )}
    >
      <span
        className={cn(
          "flex size-11 shrink-0 items-center justify-center rounded-2xl",
          active ? "bg-clay-orange text-white" : "bg-clay-sand text-clay-ink/60",
        )}
      >
        {icon}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-extrabold text-clay-ink">{title}</span>
        <span className="block text-xs font-semibold text-clay-ink/50">{desc}</span>
      </span>
      <span
        className={cn(
          "flex size-6 items-center justify-center rounded-full border-2 transition-colors",
          active ? "border-clay-orange bg-clay-orange text-white" : "border-clay-ink/20",
        )}
      >
        {active && <Check className="size-3.5" />}
      </span>
    </button>
  );
}
