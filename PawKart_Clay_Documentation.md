# 🐾 PawKart Clay — Complete Website Overview & Feature Documentation

---

## 1. Executive Overview

**PawKart Clay** is a state-of-the-art, premium e-commerce web application designed specifically for pet parents in India. Built with modern web technologies and a tactile **Claymorphism design aesthetic**, PawKart Clay delivers a vibrant, intuitive, and responsive shopping experience for dog and cat care products.

From nutritional food and dental chews to ergonomic beds, grooming supplies, and interactive toys, PawKart Clay combines an extensive curated product catalog with lightning-fast real-time search, seamless checkout, user authentication, and persistent order tracking.

---

## 2. Technology Stack & Technical Architecture

| Component | Technology | Description |
| :--- | :--- | :--- |
| **Frontend Framework** | React 18 + TypeScript + Vite | Blazing fast build system and type-safe component-driven UI architecture. |
| **Styling & Design System** | Tailwind CSS + Lucide Icons | Custom Claymorphism utility tokens (`clay-surface`, `clay-tile`), rounded geometry, soft shadows, and warm harmonious color palettes. |
| **Backend & Real-Time Database** | Convex (Serverless Cloud DB) | Reactive real-time queries and mutations for products, user accounts, and order history. |
| **Authentication** | Convex Auth (`@convex-dev/auth`) | Passwordless OTP email verification flow using RSA 2048-bit JWKS signature tokens. |
| **State & Resilience** | Dual-Layer Architecture | Primary Convex Cloud DB sync with automatic local storage fallback (`src/data/products.ts`), guaranteeing 100% catalog availability even during network latency. |
| **Animations** | Framer Motion | Smooth micro-animations, fade-ups, and interactive hover transitions. |

---

## 3. Core Features & Capabilities

### 🛍️ 3.1. Storefront & Catalog Experience
- **48+ Curated Pet Products**: High-quality items spread across 10 specialized categories:
  - **Dogs**: Dog Food, Dog Treats, Dog Toys, Dog Beds, Dog Grooming, Dog Accessories
  - **Cats**: Cat Food, Cat Treats, Cat Toys, Cat Essentials
- **Shop by Pet**: Dedicated one-click filters for Woofs (Dogs) and Meows (Cats).
- **High-Definition Multi-Angle Photo Galleries**: Every product features a 3-image gallery highlighting packaging, ingredients, size specs, and real-world pet use.

### 🔍 3.2. Real-Time Search, Filtering & Sorting
- **Instant Search Bar**: Global search supporting product names, brands (e.g., Royal Canin, Pedigree, Whiskas, Farmina, Drools, PawKart), SKUs, and keywords.
- **Multi-Facet Sidebar Filters**:
  - Filter by Category (e.g., Dog Beds, Cat Treats, Grooming)
  - Filter by Pet Type (Dog vs. Cat)
  - Filter by Brand
  - Dynamic Price Range Slider
  - Stock Availability Filter
- **Smart Sorting Options**:
  - Featured / Recommended
  - Price: Low to High
  - Price: High to Low
  - Customer Rating & Review Count

### 📦 3.3. Rich Product Detail Pages (`/product/:id`)
- **Interactive Image Viewer**: Main showcase with thumbnail gallery switcher.
- **Dynamic Pricing & Discounts**: Original MRP vs. Discounted Price with calculated savings badges (e.g., `25% OFF`).
- **Product Options**: Variant selectors for sizes (e.g., `S`, `M`, `L`, `XL`, `1.5 kg`, `3 kg`, `7 kg`) and flavors.
- **Delivery Pincode Checker**: Instant delivery eligibility validator for Indian pin codes.
- **Trust Badges**: Vet-reviewed indicator, 100% authentic product guarantee, and 30-day easy returns policy.
- **Customer Reviews & Ratings**: Overall star ratings, total verified reviews, key highlights, and full technical specifications table.

### 🛒 3.4. Shopping Cart & Dynamic Checkout Flow
- **Slide-Out Cart Drawer**: Accessible from anywhere on the site with real-time badge count.
- **Quantity Controls**: Instant item increment, decrement, and removal.
- **Free Delivery Progress Tracker**: Live progress bar calculating remaining cart amount needed for Free Shipping (Orders above ₹999).
- **Promo Code Engine**: Discount coupon application system (e.g., `PAW10` for 10% discount).
- **Multi-Step Checkout Process**:
  - Step 1: Contact Details & Shipping Address
  - Step 2: Delivery Options (Standard vs. Express)
  - Step 3: Payment Method Selection (UPI, Credit/Debit Card, Net Banking, Cash on Delivery)
  - Step 4: Instant Order Confirmation with generated Order Number.

### 🔐 3.5. User Authentication & Account Management
- **Passwordless OTP Email Auth**: Secure code verification sent directly to the user's email.
- **User Profile Dashboard (`/account`)**:
  - **Orders History**: View all past orders with status badges (`Placed`, `Processing`, `Shipped`, `Delivered`), order numbers, order date, delivery address, itemized product list, and final order total.
  - **Order Deduplication Engine**: Seamless synchronization between local device storage and Convex cloud database.
  - **Wishlist Hub**: Saved favorite items with quick "Add to Cart" actions.

---

## 4. Key Advantages & Design Philosophy

1. **Tactile Claymorphism Aesthetic**: Friendly, rounded UI with soft inset and offset shadows that feel warm, approachable, and premium for pet lovers.
2. **Zero-Latency Resilience**: Local catalog fallbacks guarantee that product cards, titles, images, and prices render immediately without waiting for server spinners.
3. **Mobile-First Responsive Design**: Flawless layout across smartphones, tablets, laptops, and desktop screens.
4. **SEO & Accessibility**: Semantic HTML5 tags, unique element IDs, clean meta tags, and structured heading hierarchies.

---

## 5. Website Map & Navigation

```
PawKart Clay
├── 🏠 Home Page (/)
│   ├── Hero Banner & Offer Callouts
│   ├── Shop By Pet (Dogs / Cats)
│   ├── Bestsellers & Featured Products Carousel
│   └── Category Highlights
├── 🛒 Product Listing Store (/products)
│   ├── Search & Filter Sidebar
│   └── Grid of Product Cards
├── 📄 Product Details Page (/product/:id)
│   ├── Photo Gallery & Specifications
│   ├── Size / Variant Selector
│   └── Pincode Delivery Check
├── 🛍️ Multi-Step Checkout (/checkout)
│   ├── Address Entry
│   ├── Payment Options
│   └── Order Summary
└── 👤 User Account Dashboard (/account)
    ├── Profile Info
    ├── Order Tracking & History
    └── Wishlist Saved Items
```
