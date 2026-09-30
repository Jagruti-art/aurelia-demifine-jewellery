import os
import json
import sqlite3
import random
import datetime
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS

# Setup Flask application
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
PARENT_DIR = os.path.dirname(BASE_DIR)
DB_PATH = os.path.join(BASE_DIR, "aurelia_luxe.db")

app = Flask(__name__, static_folder=PARENT_DIR)
CORS(app, resources={r"/api/*": {"origins": "*"}})

# --------------------------------------------------------------------------
# DATABASE INITIALIZATION
# --------------------------------------------------------------------------
def get_db_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db_connection()
    cursor = conn.cursor()

    # Products Table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS products (
            id TEXT PRIMARY KEY,
            title TEXT NOT NULL,
            subtitle TEXT,
            category TEXT NOT NULL,
            price REAL NOT NULL,
            original_price REAL,
            rating REAL DEFAULT 5.0,
            review_count INTEGER DEFAULT 100,
            badge TEXT,
            badges TEXT,
            image TEXT NOT NULL,
            hover_image TEXT,
            description TEXT,
            material TEXT,
            weight TEXT,
            length TEXT,
            is_bestseller INTEGER DEFAULT 0,
            is_new INTEGER DEFAULT 0,
            is_under999 INTEGER DEFAULT 0,
            in_stock INTEGER DEFAULT 1,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')

    # Orders Table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS orders (
            id TEXT PRIMARY KEY,
            customer_name TEXT NOT NULL,
            customer_email TEXT NOT NULL,
            customer_phone TEXT,
            street_address TEXT NOT NULL,
            city TEXT NOT NULL,
            pincode TEXT NOT NULL,
            payment_method TEXT NOT NULL,
            items TEXT NOT NULL,
            subtotal REAL NOT NULL,
            discount REAL DEFAULT 0,
            total REAL NOT NULL,
            status TEXT DEFAULT 'Processing',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')

    # Newsletter Subscribers Table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS newsletter_subscribers (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            email TEXT UNIQUE NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')

    # Seed initial products if table is empty
    cursor.execute("SELECT COUNT(*) FROM products")
    count = cursor.fetchone()[0]
    if count == 0:
        seed_initial_products(cursor)

    conn.commit()
    conn.close()

def seed_initial_products(cursor):
    initial_items = [
        {
            "id": "aur-001",
            "title": "Hearts All Over Charm Bracelet",
            "subtitle": "18K Thick Gold Vermeil | Waterproof & Anti-Tarnish",
            "category": "bracelets",
            "price": 999,
            "original_price": 1999,
            "rating": 4.9,
            "review_count": 384,
            "badge": "FLAT ₹999",
            "badges": json.dumps(["FLAT ₹999", "WATERPROOF", "BESTSELLER"]),
            "image": "https://images.unsplash.com/photo-1611591475155-426c043e480b?auto=format&fit=crop&w=800&q=80",
            "hover_image": "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=800&q=80",
            "description": "Delicate interlocking heart charms suspended on a shimmering paperclip chain. Finished with 2.5 microns of real 18K gold vermeil over hypoallergenic surgical steel.",
            "material": "18K Gold Vermeil over 316L Surgical Grade Steel",
            "is_bestseller": 1,
            "is_new": 0,
            "is_under999": 1
        },
        {
            "id": "aur-002",
            "title": "Athena Solitaire Huggie Hoops",
            "subtitle": "SGL Certified Lab Diamond Simulant | 18K Gold",
            "category": "earrings",
            "price": 1199,
            "original_price": 2399,
            "rating": 5.0,
            "review_count": 512,
            "badge": "BESTSELLER",
            "badges": json.dumps(["BESTSELLER", "SKIN-SAFE", "18K GOLD"]),
            "image": "https://images.unsplash.com/photo-1630019852942-f89202989a59?auto=format&fit=crop&w=800&q=80",
            "hover_image": "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=800&q=80",
            "description": "The ultimate everyday hoops that you will never take off. Ultra-comfortable clicker clasp with a brilliant cut round solitaire.",
            "material": "18K Gold Plated over 925 Sterling Silver, Grade 5A Zirconia",
            "is_bestseller": 1,
            "is_new": 0,
            "is_under999": 0
        },
        {
            "id": "aur-003",
            "title": "Sarvani Modern Mangalsutra Bracelet",
            "subtitle": "Traditional Black Beads with Contemporary Flair",
            "category": "mangalsutra",
            "price": 1499,
            "original_price": 2999,
            "rating": 4.9,
            "review_count": 428,
            "badge": "MOST LOVED",
            "badges": json.dumps(["MOST LOVED", "MODERN TRADITION", "WATERPROOF"]),
            "image": "https://images.unsplash.com/photo-1599643477877-530eb83abc8e?auto=format&fit=crop&w=800&q=80",
            "hover_image": "https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=800&q=80",
            "description": "Tradition modernised for the woman on the move. Micro-set black spinel beads paired with an infinity motif plated in thick 18k gold.",
            "material": "18K Gold Vermeil, Natural Black Spinel Beads",
            "is_bestseller": 1,
            "is_new": 0,
            "is_under999": 0
        },
        {
            "id": "aur-004",
            "title": "Crystal Affair Tennis Bracelet",
            "subtitle": "Endless Radiance | Micro-Pavé Prong Setting",
            "category": "bracelets",
            "price": 1399,
            "original_price": 2799,
            "rating": 4.8,
            "review_count": 290,
            "badge": "EXTRA 40% OFF",
            "badges": json.dumps(["EXTRA 40% OFF", "18K GOLD", "GLAM"]),
            "image": "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=800&q=80",
            "hover_image": "https://images.unsplash.com/photo-1611591475155-426c043e480b?auto=format&fit=crop&w=800&q=80",
            "description": "Channel high-society glamour with this flexible tennis bracelet. Precision cut and claw-set crystals give fiery brilliance.",
            "material": "Thick 18K Gold Finish, Grade AAA Austrian Crystals",
            "is_bestseller": 1,
            "is_new": 0,
            "is_under999": 0
        },
        {
            "id": "aur-005",
            "title": "Celestial Sunburst Pendant Necklace",
            "subtitle": "Dainty Cable Chain with Radiating Sun Motif",
            "category": "necklaces",
            "price": 1299,
            "original_price": 2599,
            "rating": 5.0,
            "review_count": 315,
            "badge": "SHIPS IN 24H",
            "badges": json.dumps(["SHIPS IN 24H", "WATERPROOF", "NEW DROP"]),
            "image": "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=800&q=80",
            "hover_image": "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=800&q=80",
            "description": "A symbol of warmth, power, and optimism. Central bezel-set crystal radiates textured rays of gold.",
            "material": "18K Gold Vermeil on Solid 925 Sterling Silver",
            "is_bestseller": 0,
            "is_new": 1,
            "is_under999": 0
        },
        {
            "id": "aur-006",
            "title": "Solitaire Crown Engagement Ring",
            "subtitle": "1.5 Carat Radiant Solitaire with Pavé Band",
            "category": "rings",
            "price": 999,
            "original_price": 2199,
            "rating": 4.9,
            "review_count": 640,
            "badge": "FLAT ₹999",
            "badges": json.dumps(["FLAT ₹999", "ANTI-TARNISH", "BESTSELLER"]),
            "image": "https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=800&q=80",
            "hover_image": "https://images.unsplash.com/photo-1603561591411-07134e71a2a9?auto=format&fit=crop&w=800&q=80",
            "description": "Four-prong crown holding an ultra-clear, brilliant lab-grown diamond simulant. The inner comfort curve band ensures all-day wear.",
            "material": "Platinum Plated 925 Sterling Silver / 18K Gold Tone",
            "is_bestseller": 1,
            "is_new": 0,
            "is_under999": 1
        }
    ]

    for p in initial_items:
        cursor.execute('''
            INSERT INTO products (
                id, title, subtitle, category, price, original_price, rating, review_count, 
                badge, badges, image, hover_image, description, material, is_bestseller, is_new, is_under999
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', (
            p["id"], p["title"], p["subtitle"], p["category"], p["price"], p["original_price"],
            p["rating"], p["review_count"], p["badge"], p["badges"], p["image"], p["hover_image"],
            p["description"], p["material"], p["is_bestseller"], p["is_new"], p["is_under999"]
        ))

# Initialize DB on load
init_db()

# --------------------------------------------------------------------------
# API ROUTES: HEALTH & STATS
# --------------------------------------------------------------------------
@app.route("/api/health", methods=["GET"])
def health_check():
    return jsonify({
        "status": "online",
        "brand": "Aurelia Luxe Demifine Jewellery",
        "founder": "Jagruti Patil",
        "timestamp": datetime.datetime.utcnow().isoformat()
    })

@app.route("/api/stats", methods=["GET"])
def get_analytics():
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("SELECT COUNT(*), COALESCE(SUM(total), 0) FROM orders")
    total_orders, total_revenue = cursor.fetchone()

    cursor.execute("SELECT COUNT(*) FROM orders WHERE status = 'Processing' OR status = 'Pending'")
    pending_orders = cursor.fetchone()[0]

    cursor.execute("SELECT COUNT(*) FROM products")
    total_products = cursor.fetchone()[0]

    cursor.execute("SELECT COUNT(*) FROM newsletter_subscribers")
    total_subscribers = cursor.fetchone()[0]

    conn.close()

    return jsonify({
        "total_revenue": round(total_revenue, 2),
        "total_orders": total_orders,
        "pending_orders": pending_orders,
        "total_products": total_products,
        "total_subscribers": total_subscribers
    })

# --------------------------------------------------------------------------
# API ROUTES: PRODUCTS
# --------------------------------------------------------------------------
@app.route("/api/products", methods=["GET"])
def list_products():
    category = request.args.get("category")
    conn = get_db_connection()
    cursor = conn.cursor()

    if category and category != "all":
        cursor.execute("SELECT * FROM products WHERE category = ? ORDER BY created_at DESC", (category,))
    else:
        cursor.execute("SELECT * FROM products ORDER BY created_at DESC")

    rows = cursor.fetchall()
    conn.close()

    products = []
    for r in rows:
        item = dict(r)
        try:
            item["badges"] = json.loads(item["badges"]) if item["badges"] else []
        except:
            item["badges"] = [item.get("badge", "NEW")]
        products.append(item)

    return jsonify({"success": True, "count": len(products), "products": products})

@app.route("/api/products/<product_id>", methods=["GET"])
def get_product(product_id):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM products WHERE id = ?", (product_id,))
    row = cursor.fetchone()
    conn.close()

    if not row:
        return jsonify({"success": False, "error": "Product not found"}), 404

    item = dict(row)
    try:
        item["badges"] = json.loads(item["badges"]) if item["badges"] else []
    except:
        item["badges"] = []

    return jsonify({"success": True, "product": item})

@app.route("/api/products", methods=["POST"])
def add_product():
    data = request.get_json() or {}
    if not data.get("title") or not data.get("price") or not data.get("image"):
        return jsonify({"success": False, "error": "Missing required fields (title, price, image)"}), 400

    new_id = data.get("id") or f"aur-{random.randint(100, 999)}"
    badges_str = json.dumps(data.get("badges", [data.get("badge", "NEW")]))

    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute('''
            INSERT INTO products (
                id, title, subtitle, category, price, original_price, rating, review_count,
                badge, badges, image, hover_image, description, material, is_bestseller, is_new, is_under999, in_stock
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', (
            new_id, data.get("title"), data.get("subtitle", "18K Gold Vermeil"),
            data.get("category", "necklaces"), float(data.get("price", 999)),
            float(data.get("original_price", data.get("price", 999) * 2)),
            float(data.get("rating", 5.0)), int(data.get("review_count", 50)),
            data.get("badge", "NEW"), badges_str, data.get("image"),
            data.get("hover_image", data.get("image")), data.get("description", "Exquisite demi-fine jewellery piece."),
            data.get("material", "18K Gold Vermeil"), int(data.get("is_bestseller", 0)),
            int(data.get("is_new", 1)), int(data.get("is_under999", 0)), int(data.get("in_stock", 1))
        ))
        conn.commit()
    except Exception as e:
        conn.close()
        return jsonify({"success": False, "error": str(e)}), 500

    conn.close()
    return jsonify({"success": True, "message": "Product created successfully", "id": new_id}), 201

@app.route("/api/products/<product_id>", methods=["DELETE"])
def delete_product(product_id):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM products WHERE id = ?", (product_id,))
    conn.commit()
    conn.close()
    return jsonify({"success": True, "message": f"Product {product_id} deleted"})

# --------------------------------------------------------------------------
# API ROUTES: ORDERS & CHECKOUT
# --------------------------------------------------------------------------
@app.route("/api/orders", methods=["POST"])
def create_order():
    data = request.get_json() or {}
    
    # Required validation
    required = ["customer_name", "customer_email", "street_address", "city", "pincode", "items"]
    for field in required:
        if not data.get(field):
            return jsonify({"success": False, "error": f"Field '{field}' is required"}), 400

    order_id = f"AUR-{datetime.datetime.now().year}-{random.randint(100000, 999999)}"
    items_json = json.dumps(data.get("items", []))
    subtotal = float(data.get("subtotal", 0))
    discount = float(data.get("discount", 0))
    total = float(data.get("total", subtotal - discount))

    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('''
        INSERT INTO orders (
            id, customer_name, customer_email, customer_phone, street_address,
            city, pincode, payment_method, items, subtotal, discount, total, status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ''', (
        order_id, data.get("customer_name"), data.get("customer_email"),
        data.get("customer_phone", "Not Provided"), data.get("street_address"),
        data.get("city"), data.get("pincode"), data.get("payment_method", "Cash on Delivery"),
        items_json, subtotal, discount, total, "Processing"
    ))
    conn.commit()
    conn.close()

    return jsonify({
        "success": True,
        "order_id": order_id,
        "message": "Order placed successfully! We have initiated preparation.",
        "estimated_delivery": "2-3 business days"
    }), 201

@app.route("/api/orders", methods=["GET"])
def list_orders():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM orders ORDER BY created_at DESC")
    rows = cursor.fetchall()
    conn.close()

    orders = []
    for r in rows:
        order = dict(r)
        try:
            order["items"] = json.loads(order["items"])
        except:
            order["items"] = []
        orders.append(order)

    return jsonify({"success": True, "count": len(orders), "orders": orders})

@app.route("/api/orders/<order_id>/status", methods=["PATCH"])
def update_order_status(order_id):
    data = request.get_json() or {}
    new_status = data.get("status")
    if not new_status:
        return jsonify({"success": False, "error": "New status required"}), 400

    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("UPDATE orders SET status = ? WHERE id = ?", (new_status, order_id))
    conn.commit()
    conn.close()

    return jsonify({"success": True, "message": f"Order {order_id} status updated to {new_status}"})

@app.route("/api/orders/track/<order_id>", methods=["GET"])
def track_order(order_id):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM orders WHERE id = ?", (order_id.strip(),))
    row = cursor.fetchone()
    conn.close()

    if not row:
        return jsonify({"success": False, "error": "Order tracking ID not found"}), 404

    order = dict(row)
    try:
        order["items"] = json.loads(order["items"])
    except:
        order["items"] = []

    return jsonify({"success": True, "order": order})

# --------------------------------------------------------------------------
# API ROUTES: NEWSLETTER
# --------------------------------------------------------------------------
@app.route("/api/newsletter", methods=["POST"])
def subscribe_newsletter():
    data = request.get_json() or {}
    email = data.get("email", "").strip().lower()
    if not email or "@" not in email:
        return jsonify({"success": False, "error": "Valid email address required"}), 400

    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("INSERT INTO newsletter_subscribers (email) VALUES (?)", (email,))
        conn.commit()
    except sqlite3.IntegrityError:
        pass
    conn.close()

    return jsonify({
        "success": True,
        "message": "Welcome to Aurelia Club! Coupon code 'AURELIA10' activated for 10% discount."
    })

# --------------------------------------------------------------------------
# ADMIN AUTHENTICATION
# --------------------------------------------------------------------------
@app.route("/api/admin/login", methods=["POST"])
def admin_login():
    data = request.get_json() or {}
    username = data.get("username", "").strip()
    password = data.get("password", "").strip()

    # Default secure admin credentials for Jagruti
    if (username.lower() == "jagruti" or username.lower() == "admin") and password == "aurelia2026":
        return jsonify({
            "success": True,
            "token": "aur_admin_session_valid_token_2026",
            "name": "Jagruti Patil (Owner)"
        })
    else:
        return jsonify({"success": False, "error": "Invalid username or password"}), 401

# --------------------------------------------------------------------------
# STATIC FILES SERVING (Fallback for direct access)
# --------------------------------------------------------------------------
@app.route("/", defaults={"path": "index.html"})
@app.route("/<path:path>")
def serve_static(path):
    if os.path.exists(os.path.join(PARENT_DIR, path)):
        return send_from_directory(PARENT_DIR, path)
    return send_from_directory(PARENT_DIR, "index.html")

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    print(f"AURELIA LUXE Backend running at http://localhost:{port}")
    app.run(host="0.0.0.0", port=port, debug=False)

