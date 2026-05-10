"""
Update existing database records from Chinese to English.
Run with: python update_to_english.py
Works on both local and production databases.
"""
import asyncio
from sqlalchemy import text
from app.database import async_session

# ── Product Lines ──────────────────────────────────────────────────────────────
PRODUCT_LINE_UPDATES = [
    {
        "slug": "classic-animals",
        "name": "Classic Animals",
        "description": "Our most popular collection of classic animal plush toys — bears, bunnies, dogs and more beloved characters for all ages. Crafted from premium short-pile fabric for an incredibly soft, smooth feel.",
    },
    {
        "slug": "ocean-creatures",
        "name": "Ocean Creatures",
        "description": "Adorable companions from the deep sea! Featuring whales, dolphins, octopuses, sea turtles and more marine animals in vivid colors and unique designs.",
    },
    {
        "slug": "forest-friends",
        "name": "Forest Friends",
        "description": "A woodland-themed plush collection featuring squirrels, foxes, deer, raccoons and more — natural color palettes full of rustic charm.",
    },
    {
        "slug": "cartoon-ip",
        "name": "Cartoon & Characters",
        "description": "Fan-favorite cartoon characters brought to life in soft plush form. High-fidelity designs faithfully recreated from beloved IPs — a must for fans worldwide.",
    },
    {
        "slug": "holiday-collection",
        "name": "Holiday Collection",
        "description": "Limited-edition plush toys designed for Christmas, Valentine's Day, Halloween and other major holidays — bursting with festive spirit and perfect as gifts.",
    },
    {
        "slug": "baby-comfort",
        "name": "Baby Comfort",
        "description": "Soothing plush toys designed specifically for infants 0–3 years. Safety certified, made with ultra-soft infant-grade fabric, no small parts, and fully machine washable.",
    },
    {
        "slug": "giant-plush",
        "name": "Giant Plush",
        "description": "Oversized plush toys ranging from 80cm to 200cm — striking statement pieces ideal for home décor, retail display, or as the ultimate cuddly companion.",
    },
    {
        "slug": "interactive-plush",
        "name": "Interactive Plush",
        "description": "Tech-enhanced plush toys with built-in electronics supporting sound playback, voice recording, touch response and more — for an extra layer of fun and engagement.",
    },
]

# ── Products ───────────────────────────────────────────────────────────────────
PRODUCT_UPDATES = [
    {"sku": "CA-001", "name": "Classic Teddy Bear - Brown", "description": "Classic brown teddy bear filled with high-density PP cotton for a soft and fluffy feel.", "material": "Short-pile plush + PP cotton"},
    {"sku": "CA-002", "name": "Classic Teddy Bear - White", "description": "Pure white teddy bear, perfect for wedding décor and gift markets.", "material": "Short-pile plush + PP cotton"},
    {"sku": "CA-003", "name": "Floppy Ear Bunny", "description": "Adorable floppy-eared bunny with long ears, available in multiple colors.", "material": "Crystal ultra-soft + PP cotton"},
    {"sku": "CA-004", "name": "Corgi Dog Plush", "description": "Irresistibly cute Corgi dog with iconic round bottom — a social media sensation.", "material": "Short-pile plush + PP cotton"},
    {"sku": "CA-005", "name": "Lazy Cat Pillow", "description": "Relaxed lying cat design that doubles as a comfy pillow — cute and practical.", "material": "Stretch ultra-soft + PP cotton"},
    {"sku": "CA-006", "name": "Alpaca Plush", "description": "Adorable alpaca with a fluffy long-hair design and exceptional handfeel.", "material": "Long-pile plush + PP cotton"},
    {"sku": "OC-001", "name": "Blue Whale Plush", "description": "Streamlined whale shape with a gradient blue design, perfect for ocean-themed décor.", "material": "Crystal ultra-soft + PP cotton"},
    {"sku": "OC-002", "name": "Reversible Octopus", "description": "Flip-and-reveal octopus with happy/grumpy faces — a viral TikTok bestseller.", "material": "Short-pile plush + PP cotton"},
    {"sku": "OC-003", "name": "Baby Sea Turtle", "description": "Cute sea turtle with a detachable, washable shell — eco-conscious design.", "material": "Short-pile plush + PP cotton"},
    {"sku": "OC-004", "name": "Pink Dolphin", "description": "Dreamy pink dolphin in soft elastic material, also usable as a neck pillow.", "material": "Stretch ultra-soft + PP cotton"},
    {"sku": "OC-005", "name": "Clownfish Plush", "description": "Orange and white striped clownfish in vibrant colors, beloved by children.", "material": "Short-pile plush + PP cotton"},
    {"sku": "FF-001", "name": "Mr. Fox Plush", "description": "Dapper fox with a bow tie in classic orange and white coloring.", "material": "Short-pile plush + PP cotton"},
    {"sku": "FF-002", "name": "Cute Squirrel Plush", "description": "Fluffy big-tailed squirrel holding an acorn accessory in a charming natural style.", "material": "Long-pile plush + PP cotton"},
    {"sku": "FF-003", "name": "Baby Spotted Deer", "description": "Gentle spotted deer with hand-embroidered spots — delicate and refined craftsmanship.", "material": "Short-pile plush + PP cotton"},
    {"sku": "FF-004", "name": "Raccoon Explorer", "description": "Hat-wearing raccoon explorer with a removable backpack accessory.", "material": "Short-pile plush + PP cotton"},
    {"sku": "CI-001", "name": "Baby Dinosaur - Green", "description": "Super cute baby dinosaur with a rounded body design, available in multiple colors.", "material": "Crystal ultra-soft + PP cotton"},
    {"sku": "CI-002", "name": "Unicorn Princess", "description": "Dreamy unicorn with a rainbow mane and a glittery sparkle horn.", "material": "Long-pile plush + PP cotton"},
    {"sku": "CI-003", "name": "Space Panda", "description": "Panda dressed in a space suit — a space-themed design with a futuristic feel.", "material": "Short-pile plush + PP cotton"},
    {"sku": "HC-001", "name": "Christmas Reindeer", "description": "Red-nosed reindeer with Santa hat and scarf — an essential holiday decoration.", "material": "Short-pile plush + PP cotton"},
    {"sku": "HC-002", "name": "Valentine Heart Bear", "description": "White bear hugging a red heart — a bestselling Valentine's Day gift.", "material": "Short-pile plush + PP cotton"},
    {"sku": "HC-003", "name": "Halloween Pumpkin Cat", "description": "Black cat holding a pumpkin — a Halloween limited-edition design.", "material": "Short-pile plush + PP cotton"},
    {"sku": "BC-001", "name": "Bunny Comfort Blanket", "description": "Soft security blanket with a bunny head design. CE/CPC certified and fully machine washable.", "material": "Infant-grade ultra-soft + PP cotton"},
    {"sku": "BC-002", "name": "Elephant Music Box", "description": "Pull-string elephant that plays gentle lullabies — the ultimate sleep soother.", "material": "Infant-grade ultra-soft + PP cotton + electronic module"},
    {"sku": "BC-003", "name": "Rainbow Stacking Rings", "description": "Plush stacking rings toy with varied textures to develop grasping and motor skills.", "material": "Mixed fabrics + PP cotton"},
    {"sku": "GP-001", "name": "Giant Teddy Bear 100cm", "description": "100cm giant teddy bear — ideal for home décor and retail display.", "material": "Short-pile plush + PP cotton"},
    {"sku": "GP-002", "name": "Giant Teddy Bear 160cm", "description": "160cm oversized teddy bear — the classic larger-than-life huggable companion.", "material": "Short-pile plush + PP cotton"},
    {"sku": "GP-003", "name": "Giant Unicorn 120cm", "description": "120cm fantasy unicorn with a rideable design and a stunning rainbow color palette.", "material": "Long-pile plush + PP cotton"},
    {"sku": "IP-001", "name": "Talking Parrot", "description": "Record-and-repeat parrot: press wing to record, release to play back in a funny pitched voice.", "material": "Short-pile plush + PP cotton + electronic module"},
    {"sku": "IP-002", "name": "Starry Night Glow Bunny", "description": "Press tummy to project a starry night light show. USB rechargeable — perfect for soothing sleep.", "material": "Short-pile plush + PP cotton + LED module"},
    {"sku": "IP-003", "name": "Dancing Cactus", "description": "Dancing, singing and recording cactus with 120 built-in songs.", "material": "Short-pile plush + PP cotton + electronic module"},
]

# ── Banners ────────────────────────────────────────────────────────────────────
BANNER_UPDATES = [
    {
        "sort_order": 1,
        "tag": "New Arrival",
        "title": "Ultra-Soft Plush Collection",
        "subtitle": "Premium long-pile fabric with an incredibly soft & silky feel\nOEM/ODM Custom Orders — Min. 500 pcs MOQ",
        "cta_text": "Request a Quote",
    },
    {
        "sort_order": 2,
        "tag": "Bestsellers",
        "title": "Classic Animal Plush Toys",
        "subtitle": "Pandas, bunnies, foxes and 100+ styles to choose from\nCE, CPC & ASTM Safety Certified",
        "cta_text": "Browse Products",
    },
    {
        "sort_order": 3,
        "tag": "Factory Direct",
        "title": "10+ Years of Export Experience",
        "subtitle": "Exported to 50+ countries across Europe, Americas, Japan & Korea\nFull-service from sampling to mass production",
        "cta_text": "Learn More",
    },
]


async def update():
    async with async_session() as session:
        pl_updated = 0
        for pl in PRODUCT_LINE_UPDATES:
            result = await session.execute(
                text("UPDATE product_lines SET name=:name, description=:description WHERE slug=:slug"),
                {"name": pl["name"], "description": pl["description"], "slug": pl["slug"]},
            )
            pl_updated += result.rowcount

        prod_updated = 0
        for p in PRODUCT_UPDATES:
            result = await session.execute(
                text("UPDATE products SET name=:name, description=:description, material=:material WHERE sku=:sku"),
                {"name": p["name"], "description": p["description"], "material": p["material"], "sku": p["sku"]},
            )
            prod_updated += result.rowcount

        banner_updated = 0
        for b in BANNER_UPDATES:
            result = await session.execute(
                text("UPDATE banners SET tag=:tag, title=:title, subtitle=:subtitle, cta_text=:cta_text WHERE sort_order=:sort_order"),
                {"tag": b["tag"], "title": b["title"], "subtitle": b["subtitle"], "cta_text": b["cta_text"], "sort_order": b["sort_order"]},
            )
            banner_updated += result.rowcount

        await session.commit()

    print(f"✅ Updated {pl_updated} product lines")
    print(f"✅ Updated {prod_updated} products")
    print(f"✅ Updated {banner_updated} banners")
    print("Done! All records are now in English.")


if __name__ == "__main__":
    asyncio.run(update())
