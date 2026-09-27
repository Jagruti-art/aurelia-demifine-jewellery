# ✨ AURELIA LUXE - Demifine® Everyday Luxury Jewellery

> **Created & Handcrafted by Jagruti Patil**  
> Inspired by the elegance, craftsmanship, and modern luxury of **Palmonas** (India's premier demi-fine jewellery brand).

---

## 🌟 About The Brand

**AURELIA LUXE** is a modern, responsive luxury e-commerce experience celebrating **Demifine® Everyday Jewellery**. It bridges the gap between fragile expensive 22K gold and low-quality fast-fashion pieces.

Crafted with:
- **18K Thick Gold Vermeil** (2.5 microns thick, vacuum PVD bonded)
- **925 Pure Sterling Silver & Surgical Grade 316L Stainless Steel**
- **100% Waterproof, Sweatproof, and Skin-Safe** (Zero nickel, zero lead, no green skin)
- **SGL Certified Lab-Grown Diamonds** & Grade 5A Austrian Cubic Zirconia
- **1-Year Anti-Tarnish Warranty** & Lifetime Re-plating

---

## 💎 Features Replicated & Enhanced from Palmonas

1. **Top Announcement Ticker**: Rotating marquee with promotional festival alerts, shipping guarantees, and trust highlights.
2. **Luxury Sticky Header**: Clean luxury serif logo (`AURELIA`), location pincode detector, currency selector, instant search modal, interactive wishlist heart with badge counter, and cart toggle.
3. **Category Story Circles (Palmonas Signature Look)**: Visual circular story thumbnails with smooth horizontal scroll across Earrings, Necklaces, Bracelets, Rings, Mangalsutras, Men's, and Flat ₹999.
4. **Hero Banner Slider**: Multi-slide luxury carousel with auto-play, navigation dots, and bespoke promotional calls to action.
5. **Interactive Delivery Pincode Checker**: Enter any 6-digit Indian pincode to verify instant 24-48h express delivery eligibility with city auto-detection.
6. **Stack Up Fest Bar**: Live countdown timer (Hours, Mins, Secs) and coupon code trigger.
7. **Category Tabs & Sorting**: Instant filter across *All*, *Best Sellers*, *Flat ₹999*, *New Drops*, *Earrings*, *Necklaces*, *Bracelets*, *Rings*, *Mangalsutras*, and *Men's Luxe*.
8. **Dynamic Product Cards with Rotating Ribbon Badges**:
   - Replicates Palmonas' signature rotating badge algorithm (`FLAT ₹999` ➔ `WATERPROOF` ➔ `18K GOLD` ➔ `BESTSELLER`).
   - Image swap on hover (lifestyle vs product cut-out).
   - Instant "Add to Bag" and "Quick View" actions.
   - Live wishlist toggle button with heart animation.
9. **Interactive Slide-Out Shopping Bag (Cart Drawer)**:
   - Free Gift Progress Bar (tracks how much to add to unlock a free Gold Care Kit!).
   - Quantity increment/decrement (+ / -) controls.
   - Working coupon code application:
     - `AURELIA10` (10% Off)
     - `STACKUP` (₹500 Fest Discount)
     - `PATIL50` (50% Founder VIP Discount)
   - Real-time subtotal, discount, free shipping, and grand total calculations.
10. **Product Quick View Modal**:
    - High-resolution zoomable gallery.
    - Metal finish selector (`18K Gold Vermeil`, `925 Platinum Silver`, `Rose Gold Luxe`).
    - Specification highlights and instant "Buy Now" button.
11. **Simulated Secure Checkout Modal**:
    - Shipping address form.
    - Payment method selector: UPI / Google Pay, Cards / EMI, Cash on Delivery.
    - Instant order placement generating a real tracking ID (e.g. `AUR-2026-XXXXXX`).
12. **Live Search Modal**: Real-time filtering as you type across product names, categories, and materials.
13. **Why Demifine? Comparison Table**: Side-by-side comparison of cheap fashion jewellery vs Aurelia Demifine vs solid 22K gold.
14. **Shop With Confidence USPs**: 4 trust pillars detailing skin safety, 18K plating, certified stones, and warranty.
15. **Founder Story Section**: Highlighting **Jagruti Patil's** mission to make luxury wearable every single day.
16. **Customer Reviews Carousel & FAQ Accordion**: Real buyer testimonials and expandable Q&A answering common buyer questions.
17. **Floating WhatsApp Concierge**: Instant customer support link.

---

## 🚀 How to Run the Website

### Option 1: Live Local Server (Recommended)
You can run the built-in server with Python:

```bash
cd "C:\Users\Jagruti Patil\.gemini\antigravity\scratch\aurelia-demifine-jewellery"
python -m http.server 8000
```

Then open your browser at:
👉 **[http://localhost:8000](http://localhost:8000)**

---

### Option 2: Direct File Launch
Double click `index.html` or open this file directly in any web browser:
👉 `C:\Users\Jagruti Patil\.gemini\antigravity\scratch\aurelia-demifine-jewellery\index.html`

No build tools or Node.js dependencies are required! It works out-of-the-box in Chrome, Edge, Safari, and Firefox.

---

## 📁 Project Structure

```
aurelia-demifine-jewellery/
├── index.html            # Main semantic HTML5 webpage with all luxury sections
├── css/
│   ├── style.css         # Luxury brand typography, layout, grids, and responsiveness
│   └── components.css    # Modals, cart drawer, checkout, badges, toast, search
├── js/
│   ├── products.js       # Complete jewellery catalog with pricing, images, specs & reviews
│   └── app.js            # Reactive shopping cart, wishlist, pincode checker, checkout
└── README.md             # Complete project guide and documentation
```

---

## 🎨 Customization Guide

- **Change Brand Name**: Search for `AURELIA` in `index.html` and replace it with your preferred name.
- **Change Founder Credit**: Search for `Jagruti Patil` in `index.html` and `style.css`.
- **Add New Products**: Open `js/products.js` and append a new product object to `PRODUCTS_DATA`.
- **Add Coupons**: Open `js/app.js` and modify the `applyCoupon()` function.
