# 💎 House of Diams - Master Admin Dashboard Blueprint (v0.dev Edition)

This is the definitive, 1:1 blueprint for building your Admin Panel. It uses the exact component names and data structures currently in your project.

---

## 🎨 Global UI & Design System
> "Build an ultra-premium Admin Dashboard for a high-end jewellery brand. 
> - **Colors:** Background `#FBF9F5`, Accents `#B8922A` (Gold) and `#14120D` (Ink).
> - **Typography:** Serif headings (`Cormorant Garamond`), Sans-serif body (`Montserrat`), and Numeric font (`Modamode`).
> - **Components:** Use `shadcn/ui` with custom gold-tinted variants. The layout must have a collapsible side-navigation and a global 'Live/Staging' status toggle."

---

## Phase 1: Product Inventory & Management (1:1 with `products.ts`)
**Prompt for v0:**
> "Build the **Inventory System** to manage `JewelleryProduct` objects. 
> **Fields required:**
> - **Identification:** `id`, `name`, `SKU`, `featured` (toggle).
> - **Taxonomy:** `category` ('fine', 'hiphop'), `type` ('ring', 'necklace', 'bracelet', 'earrings').
> - **Pricing Engine:** `basePrice`, `discountPrice`, and a 'Scheduled Pricing' field for market rate adjustments (e.g., +5% Gold price bump).
> - **Configuration Variants:** 
>   - Metal: Multi-select (Yellow Gold, White Gold, Rose Gold, Platinum).
>   - Purity: Multi-select (14K, 18K, 22K).
> - **Gemology Specs:** 
>   - `gemStyle`: Select (Round, Pear, Oval, Emerald, Trilogy).
>   - `gemColor`: Color picker/text.
> - **Media:** Drag-and-drop for `imageUrl`, a list manager for `galleryUrls` (up to 4), and `videoUrl`.
> - **Content:** `description` (Rich Text), `features` (Array of strings), `tagLine` (short string)."

---

## Phase 2: Content Management System (CMS) - Page by Page
**Prompt for v0:**
> "Build the **CMS Page** with specific editors for these existing components:
> 
> **1. Home Page Sections:**
> - **Hero:** { eyebrow, headline, subtitle, primaryCTA, secondaryCTA }.
> - **StatsStrip:** Array of { target: number, suffix: string, label: string }.
> - **Manufacturing:** List of 5 steps { num, title, body, iconSVG }.
> - **Testimonials:** List of { text, author, origin }.
> - **FAQ:** List of { q: string, a: string }.
> - **InstagramReels:** List of { label, videoUrl }.
> 
> **2. About Page Sections:**
> - **AboutHero:** { headline, storyBody, eyebrow }.
> - **FoundersSection:** List of 2 profiles { initials, name, title, bio }.
> - **TimelineSection:** List of milestones { year, label, isFuture }.
> 
> **3. Bespoke Page Sections:**
> - **BespokePortfolio:** A dedicated gallery manager to add new pieces to the 'Past Creations' grid. Fields: { title, tag, category, isVideo, gemType, gemColor, mediaUrl }.
> 
> **4. Global Elements:**
> - **AnnouncementBar:** Editable scrolling text for the top bar.
> - **Footer:** Edit global contact email, phone, and office addresses."

---

## Phase 3: Media, Recycle Bin & Operations
**Prompt for v0:**
> "Build the **Media Hub & Recycle Bin** system:
> - **Media Library:** A central grid of all uploaded files. Each item has 'Copy URL', 'Replace', and 'Move to Trash'.
> - **Recycle Bin:** A view of all items (Products, CMS sections, Media) marked as `deleted_at`. Provide 'Restore' or 'Wipe' buttons.
> 
> **Support & Docs:**
> - **Customers Tab:** A lead list showing every enquiry made via the `EnquireModal` (capture Name, Email, Product Interest).
> - **Docs Tab:** Rich text editors for `Terms & Conditions`, `Privacy Policy`, and `Shipping Policy`.
> 
> **Payments & Shipping:**
> - **Payments:** Dashboard showing recent transaction IDs and statuses.
> - **Shipping:** CRUD interface to set shipping costs for 'Domestic' and 'International' regions."

---

## Phase 4: Customer Relations (CRM) & Leads
**Prompt for v0:**
> "Build a **CRM Tab** specifically for handling client enquiries. 
> - **Enquiry Table:** Columns for 'Customer Name', 'Interested Piece', 'Contact Method' (WhatsApp/Email), 'Timestamp', and 'Status' (New, Contacted, Completed).
> - **B2B Tab:** A separate list for wholesale leads captured from the B2B page process steps."

---

### Pro-Tip for Product Structure:
In the dashboard, when an admin selects a **Category** (e.g., 'Fine Jewellery'), the **Type** dropdown should automatically filter to relevant types (e.g., 'Engagement Ring', 'Tennis Bracelet') to match your site's navigation logic.
