"""Seed script to populate the database with sample plush toy data."""
import asyncio
from decimal import Decimal

from sqlalchemy import text

from app.database import Base, async_session, engine
from app.models.banner import Banner
from app.models.company_image import CompanyImage  # noqa: F401 – registers table with Base
from app.models.product import Product
from app.models.product_line import ProductLine
from app.models.review import CustomerReview  # noqa: F401 – registers table with Base
from app.models.user import User, UserRole
from app.utils.auth import hash_password

PRODUCT_LINES = [
    {"name": "Classic Animals", "slug": "classic-animals", "description": "Our most popular collection of classic animal plush toys — bears, bunnies, dogs and more beloved characters for all ages. Crafted from premium short-pile fabric for an incredibly soft, smooth feel.", "sort_order": 1},
    {"name": "Ocean Creatures", "slug": "ocean-creatures", "description": "Adorable companions from the deep sea! Featuring whales, dolphins, octopuses, sea turtles and more marine animals in vivid colors and unique designs.", "sort_order": 2},
    {"name": "Forest Friends", "slug": "forest-friends", "description": "A woodland-themed plush collection featuring squirrels, foxes, deer, raccoons and more — natural color palettes full of rustic charm.", "sort_order": 3},
    {"name": "Cartoon & Characters", "slug": "cartoon-ip", "description": "Fan-favorite cartoon characters brought to life in soft plush form. High-fidelity designs faithfully recreated from beloved IPs — a must for fans worldwide.", "sort_order": 4},
    {"name": "Holiday Collection", "slug": "holiday-collection", "description": "Limited-edition plush toys designed for Christmas, Valentine's Day, Halloween and other major holidays — bursting with festive spirit and perfect as gifts.", "sort_order": 5},
    {"name": "Baby Comfort", "slug": "baby-comfort", "description": "Soothing plush toys designed specifically for infants 0–3 years. Safety certified, made with ultra-soft infant-grade fabric, no small parts, and fully machine washable.", "sort_order": 6},
    {"name": "Giant Plush", "slug": "giant-plush", "description": "Oversized plush toys ranging from 80cm to 200cm — striking statement pieces ideal for home décor, retail display, or as the ultimate cuddly companion.", "sort_order": 7},
    {"name": "Interactive Plush", "slug": "interactive-plush", "description": "Tech-enhanced plush toys with built-in electronics supporting sound playback, voice recording, touch response and more — for an extra layer of fun and engagement.", "sort_order": 8},
]

PRODUCTS = [
    # Classic Animals
    {"product_line_slug": "classic-animals", "name": "Classic Teddy Bear - Brown", "sku": "CA-001", "description": "Classic brown teddy bear filled with high-density PP cotton for a soft and fluffy feel.", "price": Decimal("8.50"), "min_order_qty": 100, "material": "Short-pile plush + PP cotton", "size": "30cm", "weight": "200g", "is_featured": True, "is_new": False},
    {"product_line_slug": "classic-animals", "name": "Classic Teddy Bear - White", "sku": "CA-002", "description": "Pure white teddy bear, perfect for wedding décor and gift markets.", "price": Decimal("8.50"), "min_order_qty": 100, "material": "Short-pile plush + PP cotton", "size": "30cm", "weight": "200g", "is_featured": False, "is_new": False},
    {"product_line_slug": "classic-animals", "name": "Floppy Ear Bunny", "sku": "CA-003", "description": "Adorable floppy-eared bunny with long ears, available in multiple colors.", "price": Decimal("6.80"), "min_order_qty": 200, "material": "Crystal ultra-soft + PP cotton", "size": "25cm", "weight": "150g", "is_featured": True, "is_new": True},
    {"product_line_slug": "classic-animals", "name": "Corgi Dog Plush", "sku": "CA-004", "description": "Irresistibly cute Corgi dog with iconic round bottom — a social media sensation.", "price": Decimal("9.20"), "min_order_qty": 100, "material": "Short-pile plush + PP cotton", "size": "35cm", "weight": "250g", "is_featured": True, "is_new": True},
    {"product_line_slug": "classic-animals", "name": "Lazy Cat Pillow", "sku": "CA-005", "description": "Relaxed lying cat design that doubles as a comfy pillow — cute and practical.", "price": Decimal("7.50"), "min_order_qty": 150, "material": "Stretch ultra-soft + PP cotton", "size": "40cm", "weight": "300g", "is_featured": False, "is_new": False},
    {"product_line_slug": "classic-animals", "name": "Alpaca Plush", "sku": "CA-006", "description": "Adorable alpaca with a fluffy long-hair design and exceptional handfeel.", "price": Decimal("10.50"), "min_order_qty": 100, "material": "Long-pile plush + PP cotton", "size": "35cm", "weight": "280g", "is_featured": False, "is_new": True},
    # Ocean Creatures
    {"product_line_slug": "ocean-creatures", "name": "Blue Whale Plush", "sku": "OC-001", "description": "Streamlined whale shape with a gradient blue design, perfect for ocean-themed décor.", "price": Decimal("12.00"), "min_order_qty": 80, "material": "Crystal ultra-soft + PP cotton", "size": "50cm", "weight": "400g", "is_featured": True, "is_new": False},
    {"product_line_slug": "ocean-creatures", "name": "Reversible Octopus", "sku": "OC-002", "description": "Flip-and-reveal octopus with happy/grumpy faces — a viral TikTok bestseller.", "price": Decimal("4.50"), "min_order_qty": 500, "material": "Short-pile plush + PP cotton", "size": "20cm", "weight": "100g", "is_featured": True, "is_new": False},
    {"product_line_slug": "ocean-creatures", "name": "Baby Sea Turtle", "sku": "OC-003", "description": "Cute sea turtle with a detachable, washable shell — eco-conscious design.", "price": Decimal("7.80"), "min_order_qty": 150, "material": "Short-pile plush + PP cotton", "size": "30cm", "weight": "200g", "is_featured": False, "is_new": True},
    {"product_line_slug": "ocean-creatures", "name": "Pink Dolphin", "sku": "OC-004", "description": "Dreamy pink dolphin in soft elastic material, also usable as a neck pillow.", "price": Decimal("8.00"), "min_order_qty": 100, "material": "Stretch ultra-soft + PP cotton", "size": "45cm", "weight": "250g", "is_featured": False, "is_new": False},
    {"product_line_slug": "ocean-creatures", "name": "Clownfish Plush", "sku": "OC-005", "description": "Orange and white striped clownfish in vibrant colors, beloved by children.", "price": Decimal("5.50"), "min_order_qty": 200, "material": "Short-pile plush + PP cotton", "size": "25cm", "weight": "120g", "is_featured": False, "is_new": True},
    # Forest Friends
    {"product_line_slug": "forest-friends", "name": "Mr. Fox Plush", "sku": "FF-001", "description": "Dapper fox with a bow tie in classic orange and white coloring.", "price": Decimal("9.80"), "min_order_qty": 100, "material": "Short-pile plush + PP cotton", "size": "35cm", "weight": "250g", "is_featured": True, "is_new": True},
    {"product_line_slug": "forest-friends", "name": "Cute Squirrel Plush", "sku": "FF-002", "description": "Fluffy big-tailed squirrel holding an acorn accessory in a charming natural style.", "price": Decimal("7.20"), "min_order_qty": 150, "material": "Long-pile plush + PP cotton", "size": "28cm", "weight": "180g", "is_featured": False, "is_new": False},
    {"product_line_slug": "forest-friends", "name": "Baby Spotted Deer", "sku": "FF-003", "description": "Gentle spotted deer with hand-embroidered spots — delicate and refined craftsmanship.", "price": Decimal("11.00"), "min_order_qty": 80, "material": "Short-pile plush + PP cotton", "size": "40cm", "weight": "300g", "is_featured": True, "is_new": False},
    {"product_line_slug": "forest-friends", "name": "Raccoon Explorer", "sku": "FF-004", "description": "Hat-wearing raccoon explorer with a removable backpack accessory.", "price": Decimal("10.50"), "min_order_qty": 100, "material": "Short-pile plush + PP cotton", "size": "32cm", "weight": "220g", "is_featured": False, "is_new": True},
    # Cartoon & Characters
    {"product_line_slug": "cartoon-ip", "name": "Baby Dinosaur - Green", "sku": "CI-001", "description": "Super cute baby dinosaur with a rounded body design, available in multiple colors.", "price": Decimal("7.00"), "min_order_qty": 200, "material": "Crystal ultra-soft + PP cotton", "size": "30cm", "weight": "200g", "is_featured": True, "is_new": False},
    {"product_line_slug": "cartoon-ip", "name": "Unicorn Princess", "sku": "CI-002", "description": "Dreamy unicorn with a rainbow mane and a glittery sparkle horn.", "price": Decimal("11.50"), "min_order_qty": 100, "material": "Long-pile plush + PP cotton", "size": "38cm", "weight": "280g", "is_featured": True, "is_new": True},
    {"product_line_slug": "cartoon-ip", "name": "Space Panda", "sku": "CI-003", "description": "Panda dressed in a space suit — a space-themed design with a futuristic feel.", "price": Decimal("13.00"), "min_order_qty": 80, "material": "Short-pile plush + PP cotton", "size": "35cm", "weight": "300g", "is_featured": False, "is_new": True},
    # Holiday Collection
    {"product_line_slug": "holiday-collection", "name": "Christmas Reindeer", "sku": "HC-001", "description": "Red-nosed reindeer with Santa hat and scarf — an essential holiday decoration.", "price": Decimal("8.80"), "min_order_qty": 200, "material": "Short-pile plush + PP cotton", "size": "30cm", "weight": "200g", "is_featured": True, "is_new": False},
    {"product_line_slug": "holiday-collection", "name": "Valentine Heart Bear", "sku": "HC-002", "description": "White bear hugging a red heart — a bestselling Valentine's Day gift.", "price": Decimal("6.50"), "min_order_qty": 300, "material": "Short-pile plush + PP cotton", "size": "25cm", "weight": "150g", "is_featured": False, "is_new": False},
    {"product_line_slug": "holiday-collection", "name": "Halloween Pumpkin Cat", "sku": "HC-003", "description": "Black cat holding a pumpkin — a Halloween limited-edition design.", "price": Decimal("7.50"), "min_order_qty": 200, "material": "Short-pile plush + PP cotton", "size": "28cm", "weight": "180g", "is_featured": False, "is_new": True},
    # Baby Comfort
    {"product_line_slug": "baby-comfort", "name": "Bunny Comfort Blanket", "sku": "BC-001", "description": "Soft security blanket with a bunny head design. CE/CPC certified and fully machine washable.", "price": Decimal("3.80"), "min_order_qty": 500, "material": "Infant-grade ultra-soft + PP cotton", "size": "30cm", "weight": "80g", "is_featured": True, "is_new": False},
    {"product_line_slug": "baby-comfort", "name": "Elephant Music Box", "sku": "BC-002", "description": "Pull-string elephant that plays gentle lullabies — the ultimate sleep soother.", "price": Decimal("8.50"), "min_order_qty": 100, "material": "Infant-grade ultra-soft + PP cotton + electronic module", "size": "25cm", "weight": "180g", "is_featured": True, "is_new": True},
    {"product_line_slug": "baby-comfort", "name": "Rainbow Stacking Rings", "sku": "BC-003", "description": "Plush stacking rings toy with varied textures to develop grasping and motor skills.", "price": Decimal("6.00"), "min_order_qty": 200, "material": "Mixed fabrics + PP cotton", "size": "25cm", "weight": "150g", "is_featured": False, "is_new": True},
    # Giant Plush
    {"product_line_slug": "giant-plush", "name": "Giant Teddy Bear 100cm", "sku": "GP-001", "description": "100cm giant teddy bear — ideal for home décor and retail display.", "price": Decimal("35.00"), "min_order_qty": 20, "material": "Short-pile plush + PP cotton", "size": "100cm", "weight": "2000g", "is_featured": True, "is_new": False},
    {"product_line_slug": "giant-plush", "name": "Giant Teddy Bear 160cm", "sku": "GP-002", "description": "160cm oversized teddy bear — the classic larger-than-life huggable companion.", "price": Decimal("65.00"), "min_order_qty": 10, "material": "Short-pile plush + PP cotton", "size": "160cm", "weight": "4500g", "is_featured": False, "is_new": False},
    {"product_line_slug": "giant-plush", "name": "Giant Unicorn 120cm", "sku": "GP-003", "description": "120cm fantasy unicorn with a rideable design and a stunning rainbow color palette.", "price": Decimal("48.00"), "min_order_qty": 15, "material": "Long-pile plush + PP cotton", "size": "120cm", "weight": "3000g", "is_featured": True, "is_new": True},
    # Interactive Plush
    {"product_line_slug": "interactive-plush", "name": "Talking Parrot", "sku": "IP-001", "description": "Record-and-repeat parrot: press wing to record, release to play back in a funny pitched voice.", "price": Decimal("5.50"), "min_order_qty": 200, "material": "Short-pile plush + PP cotton + electronic module", "size": "20cm", "weight": "150g", "is_featured": True, "is_new": False},
    {"product_line_slug": "interactive-plush", "name": "Starry Night Glow Bunny", "sku": "IP-002", "description": "Press tummy to project a starry night light show. USB rechargeable — perfect for soothing sleep.", "price": Decimal("12.00"), "min_order_qty": 80, "material": "Short-pile plush + PP cotton + LED module", "size": "30cm", "weight": "250g", "is_featured": False, "is_new": True},
    {"product_line_slug": "interactive-plush", "name": "Dancing Cactus", "sku": "IP-003", "description": "Dancing, singing and recording cactus with 120 built-in songs.", "price": Decimal("6.00"), "min_order_qty": 300, "material": "Short-pile plush + PP cotton + electronic module", "size": "32cm", "weight": "200g", "is_featured": True, "is_new": False},
]


async def seed():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
        # Ensure newly added columns also exist on databases that were originally
        # created with Base.metadata.create_all() (which does not alter existing tables).
        # All statements are idempotent on PostgreSQL 9.6+.
        await conn.execute(text("ALTER TABLE products ADD COLUMN IF NOT EXISTS intl_url VARCHAR(500)"))
        await conn.execute(text("ALTER TABLE products ADD COLUMN IF NOT EXISTS video_url VARCHAR(500)"))
        await conn.execute(text("ALTER TABLE products ADD COLUMN IF NOT EXISTS price_tiers JSONB DEFAULT '[]'::jsonb"))
        await conn.execute(text("ALTER TABLE products ADD COLUMN IF NOT EXISTS certifications JSONB DEFAULT '[]'::jsonb"))
        await conn.execute(text("ALTER TABLE product_lines ADD COLUMN IF NOT EXISTS parent_id INTEGER REFERENCES product_lines(id) ON DELETE SET NULL"))
        await conn.execute(text("CREATE INDEX IF NOT EXISTS ix_product_lines_parent_id ON product_lines(parent_id)"))

    async with async_session() as session:
        existing = await session.execute(text("SELECT COUNT(*) FROM users"))
        if existing.scalar() > 0:
            print("Database already seeded, skipping.")
            return

        admin = User(
            email="admin@plushtoy.com",
            password_hash=hash_password("admin123"),
            company_name="Plush Toy Co.",
            contact_person="Admin",
            role=UserRole.ADMIN,
            is_active=True,
        )
        demo_client = User(
            email="demo@client.com",
            password_hash=hash_password("demo123"),
            company_name="Demo Trading Co.",
            contact_person="张先生",
            phone="13800138000",
            role=UserRole.B2B_CLIENT,
            is_active=True,
        )
        session.add_all([admin, demo_client])
        await session.flush()

        slug_to_pl = {}
        for pl_data in PRODUCT_LINES:
            pl = ProductLine(**pl_data)
            session.add(pl)
            await session.flush()
            slug_to_pl[pl.slug] = pl

        for p_data in PRODUCTS:
            slug = p_data.pop("product_line_slug")
            pl = slug_to_pl[slug]
            product = Product(product_line_id=pl.id, **p_data)
            session.add(product)

        # Seed default banners
        banner_count_result = await session.execute(text("SELECT COUNT(*) FROM banners"))
        if banner_count_result.scalar() == 0:
            default_banners = [
                Banner(tag="New Arrival", title="Ultra-Soft Plush Collection", subtitle="Premium long-pile fabric with an incredibly soft & silky feel\nOEM/ODM Custom Orders — Min. 500 pcs MOQ", cta_text="Request a Quote", cta_link="/inquiry", bg_gradient="from-rose-50 via-pink-50 to-amber-50", sort_order=1, is_active=True),
                Banner(tag="Bestsellers", title="Classic Animal Plush Toys", subtitle="Pandas, bunnies, foxes and 100+ styles to choose from\nCE, CPC & ASTM Safety Certified", cta_text="Browse Products", cta_link="/products?is_featured=true", bg_gradient="from-purple-50 via-violet-50 to-pink-50", sort_order=2, is_active=True),
                Banner(tag="Factory Direct", title="10+ Years of Export Experience", subtitle="Exported to 50+ countries across Europe, Americas, Japan & Korea\nFull-service from sampling to mass production", cta_text="Learn More", cta_link="/about", bg_gradient="from-amber-50 via-orange-50 to-rose-50", sort_order=3, is_active=True),
            ]
            session.add_all(default_banners)

        await session.commit()
        print(f"Seeded {len(PRODUCT_LINES)} product lines, {len(PRODUCTS)} products, 2 users.")
        print("Admin: admin@plushtoy.com / admin123")
        print("Demo client: demo@client.com / demo123")


if __name__ == "__main__":
    asyncio.run(seed())
