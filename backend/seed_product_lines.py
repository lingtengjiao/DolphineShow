"""Reset product lines to the two-level hierarchy shown in the product catalog.

Usage (run inside the backend container or locally with DB accessible):
    python seed_product_lines.py

WARNING: This script deletes ALL existing product lines and their products first.
"""
import asyncio

from sqlalchemy import text

from app.database import async_session
from app.models.product import Product  # noqa: F401 – ensure FK is known
from app.models.product_line import ProductLine

# ---------------------------------------------------------------------------
# Catalog definition
# Each entry is either:
#   {"name": "...", "description": "..."}            → top-level, no children
#   {"name": "...", "description": "...", "children": [...]}  → parent with sub-lines
# ---------------------------------------------------------------------------
CATALOG = [
    {
        "name": "Custom Plush Toys",
        "description": "Fully customizable plush toys — bring your own design, character or IP to life with OEM/ODM service.",
        "sort_order": 1,
    },
    {
        "name": "Weighted Plush Toys",
        "description": "Sensory-friendly weighted plush toys designed to provide calming comfort for kids and adults.",
        "sort_order": 2,
    },
    {
        "name": "Teddy Bear",
        "description": "Timeless teddy bears in every size and style — from classic jointed bears to ultra-soft modern designs.",
        "sort_order": 3,
    },
    {
        "name": "Plush Toy Skins",
        "description": "DIY-friendly unstuffed plush skins, perfect for custom stuffing or replacement covers.",
        "sort_order": 4,
    },
    {
        "name": "Stuffed Animals",
        "description": "A wide range of stuffed animals covering dogs, cats, rabbits, wildlife and more.",
        "sort_order": 5,
    },
    {
        "name": "Dolls",
        "description": "Soft and porcelain dolls with exquisite detailing, suitable for display and play.",
        "sort_order": 6,
        "children": [
            {"name": "Soft Dolls", "description": "Huggable cloth dolls with embroidered features and high-quality fabric.", "sort_order": 1},
            {"name": "Porcelain Dolls", "description": "Collectible porcelain-faced dolls with fine clothing and intricate hair styling.", "sort_order": 2},
        ],
    },
    {
        "name": "Mascot Costume",
        "description": "Full-body mascot costumes for brand promotions, events and sports teams. Custom designs available.",
        "sort_order": 7,
    },
    {
        "name": "Plush Keychain Toys",
        "description": "Mini plush charms and keychains — ideal for retail impulse purchases and gift sets.",
        "sort_order": 8,
        "children": [
            {"name": "Voodoo Dolls", "description": "Fun novelty voodoo doll keychains with pins and humorous packaging.", "sort_order": 1},
        ],
    },
    {
        "name": "Festival Gifts",
        "description": "Seasonal plush gifts crafted for major holidays and celebrations worldwide.",
        "sort_order": 9,
        "children": [
            {"name": "Valentine's Day Products", "description": "Heart-themed plush bears, roses and love-inspired gifts for Valentine's Day.", "sort_order": 1},
            {"name": "Easter Gifts", "description": "Easter bunnies, chicks and egg-themed plush toys perfect for the spring season.", "sort_order": 2},
            {"name": "Halloween Gifts & Decorations", "description": "Spooky yet adorable Halloween plush — pumpkins, ghosts, witches and more.", "sort_order": 3},
            {"name": "Christmas Decorations & Gifts", "description": "Santa Claus, reindeer, snowmen and festive plush ornaments for the holiday season.", "sort_order": 4},
        ],
    },
    {
        "name": "Plush Hand Puppets & Finger Puppets",
        "description": "Engaging puppet toys for storytelling, education and children's entertainment.",
        "sort_order": 10,
    },
    {
        "name": "Pillow & Blanket",
        "description": "Plush comfort products for home and travel — pillows, blankets and multi-function designs.",
        "sort_order": 11,
        "children": [
            {"name": "Neck Pillows", "description": "Travel neck pillows in cute animal shapes for on-the-go comfort.", "sort_order": 1},
            {"name": "Blankets", "description": "Soft plush blankets in fun character prints, ideal for gifting.", "sort_order": 2},
        ],
    },
    {
        "name": "School Supplies",
        "description": "Plush-themed school and stationery accessories that make studying more fun.",
        "sort_order": 12,
        "children": [
            {"name": "Plush Backpack", "description": "Animal-shaped plush backpacks for kids — lightweight and roomy.", "sort_order": 1},
            {"name": "Plush Bags & Coin Purse", "description": "Plush tote bags, crossbody bags and coin purses with adorable character designs.", "sort_order": 2},
            {"name": "Plush Piggy Bank", "description": "Soft plush piggy banks — a fun way for children to learn to save.", "sort_order": 3},
            {"name": "Plush Note Book", "description": "Plush-covered notebooks and journals with soft-touch character covers.", "sort_order": 4},
        ],
    },
    {
        "name": "Pet Toys",
        "description": "Durable and safe plush toys designed specifically for cats, dogs and other pets.",
        "sort_order": 13,
        "children": [
            {"name": "Cat Toys", "description": "Plush mice, feather wands and crinkle toys to keep cats entertained.", "sort_order": 1},
            {"name": "Dog Toys", "description": "Chew-resistant plush toys in fun shapes designed for dogs of all sizes.", "sort_order": 2},
            {"name": "Other Pet Supplies", "description": "Plush beds, tunnels and accessories for rabbits, hamsters and other small pets.", "sort_order": 3},
        ],
    },
]


def _slug(name: str) -> str:
    import re
    s = name.lower()
    s = re.sub(r"[&'']", "", s)
    s = re.sub(r"[^a-z0-9]+", "-", s)
    return s.strip("-")


async def reset_product_lines() -> None:
    async with async_session() as session:
        # Delete all products first (FK constraint)
        await session.execute(text("DELETE FROM products"))
        # Then delete all product lines
        await session.execute(text("DELETE FROM product_lines"))
        await session.execute(text("ALTER SEQUENCE product_lines_id_seq RESTART WITH 1"))
        await session.execute(text("ALTER SEQUENCE products_id_seq RESTART WITH 1"))
        await session.flush()

        total_lines = 0
        for entry in CATALOG:
            children = entry.pop("children", [])
            parent = ProductLine(slug=_slug(entry["name"]), is_active=True, **entry)
            session.add(parent)
            await session.flush()
            total_lines += 1

            for child_data in children:
                child = ProductLine(
                    parent_id=parent.id,
                    slug=_slug(child_data["name"]),
                    is_active=True,
                    **child_data,
                )
                session.add(child)
                await session.flush()
                total_lines += 1

        await session.commit()
        print(f"Done. Inserted {total_lines} product lines ({len(CATALOG)} top-level).")
        print("NOTE: All existing products have been cleared — please re-add products via admin.")


if __name__ == "__main__":
    asyncio.run(reset_product_lines())
