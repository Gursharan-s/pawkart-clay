import { CATEGORY_IMAGES, HERO_IMAGES, px } from "@/data/products";

/* ─── Header navigation + mega menus ─────────────────────────────── */

export interface MegaGroup {
  title: string;
  links: { label: string; to: string }[];
}

export interface NavMega {
  label: string;
  to: string;
  groups: MegaGroup[];
}

export const MEGA_MENUS: NavMega[] = [
  {
    label: "Dogs",
    to: "/products?petType=dog",
    groups: [
      {
        title: "Food",
        links: [
          { label: "Dry Food", to: "/products?category=Dog+Food&q=dry" },
          { label: "Wet Food", to: "/products?category=Dog+Food" },
          { label: "Puppy Food", to: "/products?tag=puppy" },
          { label: "Grain Free", to: "/products?tag=grain-free" },
        ],
      },
      {
        title: "Treats",
        links: [
          { label: "Biscuits", to: "/products?category=Dog+Treats" },
          { label: "Dental Chews", to: "/products?tag=dental-chew" },
          { label: "Natural Treats", to: "/products?tag=natural-treat" },
        ],
      },
      {
        title: "Walk",
        links: [
          { label: "Collars", to: "/products?tag=collar" },
          { label: "Leashes", to: "/products?tag=leash" },
          { label: "Harnesses", to: "/products?tag=harness" },
        ],
      },
      {
        title: "Lifestyle",
        links: [
          { label: "Beds", to: "/products?category=Dog+Beds" },
          { label: "Toys", to: "/products?category=Dog+Toys" },
          { label: "Bowls", to: "/products?tag=bowl" },
          { label: "Clothing", to: "/products?tag=accessory" },
        ],
      },
      {
        title: "Grooming",
        links: [
          { label: "Shampoo", to: "/products?tag=shampoo" },
          { label: "Brushes", to: "/products?tag=brush" },
          { label: "Dental Care", to: "/products?tag=dental" },
        ],
      },
    ],
  },
  {
    label: "Cats",
    to: "/products?petType=cat",
    groups: [
      {
        title: "Food",
        links: [
          { label: "Dry Food", to: "/products?category=Cat+Food&q=dry" },
          { label: "Wet Food", to: "/products?category=Cat+Food" },
          { label: "Kitten Food", to: "/products?tag=kitten" },
        ],
      },
      {
        title: "Treats",
        links: [
          { label: "Crunchy Treats", to: "/products?tag=crunchy-treat" },
          { label: "Creamy Treats", to: "/products?tag=creamy-treat" },
        ],
      },
      {
        title: "Lifestyle",
        links: [
          { label: "Beds", to: "/products?category=Cat+Essentials" },
          { label: "Scratchers", to: "/products?tag=scratcher" },
          { label: "Toys", to: "/products?category=Cat+Toys" },
        ],
      },
      {
        title: "Essentials",
        links: [
          { label: "Cat Litter", to: "/products?tag=litter" },
          { label: "Bowls", to: "/products?tag=bowl" },
          { label: "Carriers", to: "/products?tag=carrier" },
        ],
      },
    ],
  },
];

export const PLAIN_LINKS = [
  { label: "Food", to: "/products?category=Dog+Food" },
  { label: "Treats", to: "/products?category=Dog+Treats" },
  { label: "Toys", to: "/products?tag=toy" },
  { label: "Grooming", to: "/products?category=Dog+Grooming" },
  { label: "Accessories", to: "/products?category=Dog+Accessories" },
  { label: "Offers", to: "/products?onSale=true" },
];

/* ─── Homepage sections ──────────────────────────────────────────── */

export const TRUST_ITEMS = [
  {
    icon: "🚚",
    title: "Fast Delivery",
    text: "Across 18,000+ pincodes in India",
  },
  {
    icon: "🔒",
    title: "Secure Payments",
    text: "UPI, cards & COD — fully protected",
  },
  {
    icon: "❤️",
    title: "Pet-Friendly Products",
    text: "Every item vet-reviewed & safe",
  },
  {
    icon: "⭐",
    title: "Trusted by Pet Parents",
    text: "4.6/5 from 25,000+ happy reviews",
  },
];

export interface CategoryCard {
  label: string;
  to: string;
  image: string;
}

export const CATEGORY_CARDS: CategoryCard[] = [
  { label: "Dog Food", to: "/products?category=Dog+Food", image: CATEGORY_IMAGES["Dog Food"] },
  { label: "Dog Treats", to: "/products?category=Dog+Treats", image: CATEGORY_IMAGES["Dog Treats"] },
  { label: "Dog Toys", to: "/products?category=Dog+Toys", image: CATEGORY_IMAGES["Dog Toys"] },
  { label: "Beds", to: "/products?category=Dog+Beds", image: CATEGORY_IMAGES["Dog Beds"] },
  { label: "Collars", to: "/products?tag=collar", image: px(8030852) },
  { label: "Leashes", to: "/products?tag=leash", image: px(28948931) },
  { label: "Grooming", to: "/products?category=Dog+Grooming", image: CATEGORY_IMAGES["Dog Grooming"] },
  { label: "Bowls", to: "/products?tag=bowl", image: px(8881548) },
  { label: "Cat Food", to: "/products?category=Cat+Food", image: CATEGORY_IMAGES["Cat Food"] },
  { label: "Cat Toys", to: "/products?category=Cat+Toys", image: CATEGORY_IMAGES["Cat Toys"] },
  { label: "Cat Litter", to: "/products?tag=litter", image: px(13705497) },
  { label: "Scratchers", to: "/products?tag=scratcher", image: px(10292639) },
];

export interface ConcernCard {
  label: string;
  emoji: string;
  to: string;
}

export const CONCERNS: ConcernCard[] = [
  { label: "Puppy Care", emoji: "🐶", to: "/products?tag=puppy" },
  { label: "Dental Care", emoji: "🦷", to: "/products?tag=dental" },
  { label: "Grooming", emoji: "✂️", to: "/products?category=Dog+Grooming" },
  { label: "Tick & Flea", emoji: "🛡️", to: "/products?tag=tick-flea" },
  { label: "Weight Management", emoji: "⚖️", to: "/products?tag=weight-management" },
  { label: "Anxiety & Comfort", emoji: "🧸", to: "/products?tag=anxiety" },
  { label: "Training", emoji: "🎓", to: "/products?tag=training" },
  { label: "Travel", emoji: "🧳", to: "/products?tag=travel" },
];

export interface DealCard {
  title: string;
  sub: string;
  to: string;
  emoji: string;
  tint: string; // clay tint class for the card surface
}

export const DEALS: DealCard[] = [
  { title: "UP TO 30% OFF", sub: "Treats", to: "/products?category=Dog+Treats", emoji: "🦴", tint: "bg-clay-butter" },
  { title: "UP TO 25% OFF", sub: "Toys", to: "/products?category=Dog+Toys", emoji: "🎾", tint: "bg-clay-mint" },
  { title: "UP TO 20% OFF", sub: "Grooming", to: "/products?category=Dog+Grooming", emoji: "🧴", tint: "bg-clay-sky" },
  { title: "UP TO 40% OFF", sub: "Accessories", to: "/products?category=Dog+Accessories", emoji: "🎀", tint: "bg-clay-blush" },
];

export interface Combo {
  name: string;
  price: number;
  mrp: number;
  image: string;
  skus: string[];
  tagline: string;
}

export const COMBOS: Combo[] = [
  {
    name: "Puppy Starter Combo",
    tagline: "Everything a new pup needs to settle in",
    price: 1499,
    mrp: 2297,
    image: HERO_IMAGES.puppy,
    skus: ["PK-DF-005", "PK-DT-007", "PK-DT-012", "PK-DT-013"],
  },
  {
    name: "Dog Walk Combo",
    tagline: "Collar, leash & paw care for daily walks",
    price: 999,
    mrp: 1276,
    image: px(12395776),
    skus: ["PK-DA-016", "PK-DA-018", "PK-DG-028", "PK-DT-011"],
  },
  {
    name: "Cat Starter Kit",
    tagline: "Scratch, hunt, dine — the full kitty kit",
    price: 1299,
    mrp: 1596,
    image: px(10292639),
    skus: ["PK-CE-045", "PK-CT-039", "PK-CE-047", "PK-CT-036"],
  },
  {
    name: "Grooming Essentials Kit",
    tagline: "A spa day at home for your best friend",
    price: 799,
    mrp: 1126,
    image: px(19021958),
    skus: ["PK-DG-026", "PK-DG-027", "PK-DG-028", "PK-DG-029"],
  },
];

export interface Article {
  title: string;
  category: string;
  image: string;
  readMins: number;
}

export const ARTICLES: Article[] = [
  {
    title: "How to choose the right dog food",
    category: "Nutrition",
    image: px(12928244, 700),
    readMins: 6,
  },
  {
    title: "5 ways to keep your cat entertained",
    category: "Play",
    image: px(16260949, 700),
    readMins: 4,
  },
  {
    title: "First-time puppy checklist",
    category: "Puppy",
    image: HERO_IMAGES.puppy,
    readMins: 7,
  },
  {
    title: "How often should you groom your pet?",
    category: "Grooming",
    image: px(19021958, 700),
    readMins: 5,
  },
];

export interface Testimonial {
  name: string;
  city: string;
  text: string;
  pet: string;
  rating: number;
}

export const TESTIMONIALS: Testimonial[] = [
  {
    name: "Aarav Mehta",
    city: "Delhi",
    pet: "Labrador, Bruno",
    rating: 5,
    text: "My Labrador absolutely loves the treats. Delivery was super fast and the quality is better than anything I've found locally.",
  },
  {
    name: "Priya Sharma",
    city: "Bengaluru",
    pet: "Persian cat, Simba",
    rating: 5,
    text: "The litter quality is genuinely next level — no dust, no smell, and Simba approves. PawKart Clay is now my one-stop pet shop.",
  },
  {
    name: "Rohan Iyer",
    city: "Mumbai",
    pet: "Beagle, Milo",
    rating: 4,
    text: "Ordered the walk combo and the harness fits Milo perfectly. Packing was adorable and the free delivery above ₹999 is a win.",
  },
  {
    name: "Sneha Patel",
    city: "Ahmedabad",
    pet: "Indie, Chutki",
    rating: 5,
    text: "As a first-time pet parent, the puppy checklist article helped more than any vet visit. And Chutki is obsessed with her squeaky bone.",
  },
];
