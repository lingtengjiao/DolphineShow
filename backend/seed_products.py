"""Generate 100 sample products across all product lines.

Usage:
    python seed_products.py
"""
import asyncio
import random
from decimal import Decimal

from sqlalchemy import select

from app.database import async_session
from app.models.product import Product
from app.models.product_line import ProductLine

# ---------------------------------------------------------------------------
# Sample data pools
# ---------------------------------------------------------------------------

MATERIALS = [
    "PP Cotton + Plush Fabric",
    "Ultra-soft Plush + PP Cotton",
    "Velboa Fabric + PP Cotton",
    "Minky Fabric + PP Cotton",
    "Organic Cotton Plush",
    "Sherpa Plush + PP Cotton",
]

SIZES = [
    "20cm / 8 inch",
    "30cm / 12 inch",
    "40cm / 16 inch",
    "50cm / 20 inch",
    "60cm / 24 inch",
    "80cm / 32 inch",
    "100cm / 40 inch",
    "25×35cm",
    "30×40cm",
]

WEIGHTS = ["80g", "120g", "200g", "350g", "500g", "750g", "1kg", "1.5kg"]

CERTIFICATIONS = [
    "CE / CPC / ASTM F963 certified",
    "CE certified, EN71 compliant",
    "ASTM F963 & CPC certified",
    "CE / EN71 / REACH compliant",
]

# Per product-line catalogue — (name_prefix, description_template)
LINE_CATALOGUE: dict[str, list[tuple[str, str]]] = {
    "custom-plush-toys": [
        ("Custom Logo Bear", "OEM/ODM custom plush bear with your brand logo embroidered on chest. Fully customizable size, color and fill."),
        ("Branded Character Plush", "Turn your IP character into a production-ready plush toy. Full sampling and bulk manufacturing service."),
        ("Promotional Plush Mascot", "Custom promotional plush mascot for trade shows, brand campaigns and retail gifting."),
        ("White-label Bunny", "Blank-label soft bunny ready for custom hang-tag and packaging. MOQ flexible from 300 pcs."),
        ("Custom Elephant Toy", "Custom elephant plush in any color. OEM service with fast 30-day sampling turnaround."),
        ("Personalized Cat Plush", "Personalized cat plush with custom name embroidery and choice of fabric and color."),
        ("OEM Dinosaur Stuffie", "Factory-direct OEM dinosaur stuffed toy. CE/CPC certified, ideal for retail and gifting."),
        ("Custom Unicorn Plush", "Custom rainbow unicorn plush with metallic horn detail. Available in 3 sizes."),
    ],
    "weighted-plush-toys": [
        ("Weighted Anxiety Bear", "5 lb weighted plush bear filled with glass beads for calming sensory support. Ideal for anxiety relief."),
        ("Weighted Elephant Buddy", "3 lb weighted elephant plush toy, great for children with sensory processing needs."),
        ("Heavy Hug Bunny", "2 lb weighted bunny with removable cover for easy washing. Deep-pressure therapy toy."),
        ("Weighted Sloth Plush", "4 lb weighted sloth, perfect for lap use during reading or screen time."),
        ("Calming Bear Pillow", "7 lb weighted bear pillow for teens and adults. Anti-anxiety, CE certified."),
    ],
    "teddy-bear": [
        ("Classic Jointed Teddy Bear", "Traditional jointed teddy bear with movable arms and legs. Premium mohair-style plush."),
        ("Giant Teddy Bear 100cm", "Oversized 100cm teddy bear, perfect for Valentine's Day and milestone gifting."),
        ("Mini Pocket Bear", "Pocket-sized 15cm teddy bear. Ideal for keyrings, party favors and retail add-ons."),
        ("Graduation Bear", "Graduation-themed teddy bear with cap and diploma. Popular graduation season gift."),
        ("Valentine Heart Bear", "Valentine's Day red heart teddy bear with satin ribbon. Comes in gift-ready packaging."),
        ("Honey Pot Bear", "Winnie-inspired honey pot teddy bear. Soft velboa fabric, super huggable."),
        ("Personalised Name Bear", "Personalised teddy bear with custom name embroidered on paw. Great for baby showers."),
    ],
    "plush-toy-skins": [
        ("DIY Unstuffed Bear Skin", "Unfilled bear plush skin ready for custom stuffing. Great for workshops and DIY kits."),
        ("Unstuffed Bunny Kit", "Bunny plush skin with all accessories. Stuff-your-own activity kit for kids."),
        ("Empty Fox Plush Cover", "Fox plush outer cover without filling. Replaceable cover for worn-out stuffed animals."),
        ("DIY Unicorn Skin Set", "Unstuffed unicorn plush with horn and ribbon accessories. DIY craft kit."),
    ],
    "stuffed-animals": [
        ("Realistic Lion Plush", "Highly detailed realistic lion stuffed animal with hand-painted eyes and premium mane."),
        ("Giant Panda Bear", "Authentic giant panda stuffed toy, 60cm. Bamboo-forest themed gift packaging available."),
        ("Soft Rabbit Plush", "Classic soft white rabbit plush in multiple sizes. Ultra-fluffy sherpa fabric."),
        ("Elephant Family Set", "Mama and baby elephant stuffed animal set. Great baby shower and nursery gift."),
        ("Fox & Friends Set", "Fox plush toy with detachable woodland friends accessories. Interactive play value."),
        ("Penguin Stuffed Animal", "Tuxedo penguin stuffed animal, standing pose. Antarctic-themed hangtag included."),
        ("Koala Bear Plush", "Huggable koala bear plush with joey in pouch. Australian-themed gift packaging."),
        ("Sloth Plush Toy", "Slow-smiling sloth plush, ultra-soft minky fabric. Hang-from-arm feature for fun play."),
    ],
    "soft-dolls": [
        ("Rag Doll Emma", "Classic cloth rag doll with embroidered face, yarn hair and cotton dress. Non-toxic dyes."),
        ("Soft Baby Doll", "Soft-body baby doll with sleeping eyes and cotton onesie. Safe for newborns+."),
        ("Cuddle Doll Rosa", "Huggable soft doll with weighted bottom for realistic hold. Great gift for toddlers."),
        ("Knitted Princess Doll", "Hand-knit-look princess doll with removable crown and tulle skirt."),
    ],
    "porcelain-dolls": [
        ("Victorian Porcelain Doll", "Collectible Victorian-era porcelain doll with hand-painted face and silk gown."),
        ("Porcelain Baby Doll", "Lifelike porcelain baby doll with glass eyes and real-hair wig. Collector edition."),
        ("Bride Porcelain Doll", "Wedding-themed porcelain doll in satin bridal gown. Display-grade with certificate."),
    ],
    "mascot-costume": [
        ("Custom Brand Mascot Costume", "Full-body custom mascot costume for sports teams, brand events and theme parks. Washable head."),
        ("Animal Mascot Bear Suit", "Bear mascot costume with ventilated head and cooling vest. Fits adults 165–185cm."),
        ("Corporate Event Mascot", "Professional corporate mascot costume with custom logo and brand colors. Fast 20-day production."),
        ("School Mascot Costume", "School spirit mascot costume. Custom colors, logo and accessories available."),
    ],
    "plush-keychain-toys": [
        ("Plush Bear Keychain", "Mini 10cm plush bear keychain in assorted colors. Great for retail POS display."),
        ("Cartoon Character Charm", "Licensed-style cartoon plush charm for bags and keys. Custom character designs available."),
        ("Graduation Cap Keychain", "Graduation-themed mini plush with cap and diploma scroll. Seasonal bestseller."),
    ],
    "voodoo-dolls": [
        ("Fun Voodoo Doll Kit", "Novelty voodoo doll with 5 pins and humorous 'curse' booklet. Gag gift bestseller."),
        ("Office Stress Voodoo Doll", "Stress-relief office voodoo doll with 'boss', 'deadline' and 'meeting' pins. Fun desk accessory."),
        ("Customizable Voodoo Doll", "Personalised voodoo doll with custom name tag. Popular bachelorette party gift."),
    ],
    "valentines-day-products": [
        ("Valentine Heart Bear 30cm", "Plush bear holding red satin heart. Comes with gift box and ribbon. V-Day bestseller."),
        ("Love You Rose Plush", "Soft plush red rose that never wilts. Velboa fabric, long stem with leaf detail."),
        ("Couple Bear Gift Set", "Matching boy & girl plush bear set with 'I Love You' banner. Valentine gift box included."),
        ("Heart Pillow Plush", "Heart-shaped plush cushion with love message embroidery. 30cm soft microfiber."),
    ],
    "easter-gifts": [
        ("Easter Bunny Plush 40cm", "Classic Easter bunny with pastel bow tie. Soft sherpa ears and feet. Basket-ready sizing."),
        ("Easter Chick Stuffie", "Fluffy yellow Easter chick plush. Available in 3 sizes. Perfect Easter basket filler."),
        ("Pastel Egg Plush Set", "Set of 6 mini plush Easter eggs in pastel colors. Fill-able hollow design."),
        ("Easter Lamb Plush", "Soft white lamb plush with Easter ribbon. Hypoallergenic PP cotton fill."),
    ],
    "halloween-gifts-decorations": [
        ("Glow Pumpkin Plush", "Plush jack-o'-lantern with LED glow insert. Safe battery compartment. Halloween must-have."),
        ("Spooky Ghost Plush", "Friendly ghost stuffed toy with glow-in-the-dark eyes. Kids' Halloween collection."),
        ("Plush Black Cat Halloween", "Black cat plush with witch hat and orange bow. Halloween home décor and gifting."),
        ("Frankenstein Stuffie", "Cute Frankenstein plush in classic green with bolts. Child-safe, CE certified."),
        ("Witch Doll Plush", "Halloween witch soft doll with broomstick and pointy hat. Stuffed decoration toy."),
    ],
    "christmas-decorations-gifts": [
        ("Santa Claus Plush 50cm", "Jumbo Santa Claus plush toy with velvet suit and real-feel beard. Christmas centerpiece."),
        ("Reindeer Rudolph Plush", "Red-nosed reindeer plush with jingle bell collar. Available in 3 sizes."),
        ("Snowman Stuffed Toy", "Classic snowman plush with carrot nose and scarf. Christmas mantle decoration."),
        ("Elf on the Shelf Plush", "Naughty elf plush toy with poseable limbs. Christmas countdown tradition toy."),
        ("Christmas Bear Gift Set", "Santa-hat plush bear with Christmas stocking and gift box. Premium holiday packaging."),
    ],
    "plush-hand-puppets-finger-puppets": [
        ("Woodland Animal Puppet Set", "Set of 5 hand puppets: fox, bear, rabbit, owl and deer. Storytelling and education."),
        ("Farm Animal Finger Puppet Set", "12-piece farm animal finger puppet set in carry pouch. Nursery and classroom toy."),
        ("Dragon Hand Puppet", "Open-mouth dragon hand puppet with movable jaw. Interactive play for kids 3+."),
        ("Dinosaur Finger Puppets", "Set of 6 dinosaur finger puppets. T-Rex, Triceratops, Brachiosaurus and more."),
    ],
    "neck-pillows": [
        ("Animal Neck Pillow – Panda", "U-shaped travel neck pillow in panda design. Memory foam insert, removable cover."),
        ("Cat Ear Neck Pillow", "Cat-ear shaped travel pillow in soft velboa. Adjustable snap closure."),
        ("Unicorn Travel Pillow", "Rainbow unicorn neck pillow with horn and mane detail. Kids' travel essential."),
        ("Bear Hoodie Neck Pillow", "Bear neck pillow that folds into a hoodie. Dual-use travel and lounge accessory."),
    ],
    "blankets": [
        ("Animal Blanket – Shark", "Shark wearable blanket with fin detail. Super-soft flannel, 150×200cm adult size."),
        ("Unicorn Blanket Plush", "Rainbow unicorn throw blanket with plush reverse. 130×160cm. Gift-box packaging."),
        ("Dinosaur Kids Blanket", "Dino-print flannel blanket with plush reverse for kids. 100×130cm cot size."),
        ("Plush Bear Blanket Set", "Plush blanket + matching mini bear plush set. Great baby shower gift."),
    ],
    "plush-backpack": [
        ("Panda Plush Backpack", "Panda-face plush mini backpack, 28cm. Padded straps, zip closure. Back-to-school essential."),
        ("Unicorn School Backpack", "Unicorn plush backpack with rainbow mane and glitter horn. Kids' ages 3–8."),
        ("Dino Plush Toddler Bag", "Dinosaur plush toddler backpack, 25cm. Safety chest clip, name tag slot."),
    ],
    "plush-bags-coin-purse": [
        ("Kawaii Cat Coin Purse", "Cat-face plush coin purse with zip closure and wrist strap. 12×10cm."),
        ("Bunny Crossbody Bag", "Bunny-ear plush crossbody bag for kids. Adjustable strap, 20×16cm main compartment."),
        ("Strawberry Plush Tote", "Strawberry-shaped plush tote bag. Extra-large 40cm, lined interior with zip pocket."),
        ("Bear Ear Clutch Bag", "Bear-ear plush clutch for teens. Faux-leather base with plush flap. Multiple colors."),
    ],
    "plush-piggy-bank": [
        ("Plush Piggy Bank – Classic Pink", "Soft plush piggy bank with coin slot and bottom stopper. 25cm, PP cotton fill."),
        ("Panda Coin Bank Plush", "Panda-themed plush coin bank. Large 30cm, holds up to 200 coins."),
        ("Unicorn Savings Bank Plush", "Unicorn plush piggy bank with glitter horn. Fun way for kids to save."),
    ],
    "plush-note-book": [
        ("Bear Plush Cover Notebook", "A5 notebook with soft bear-face plush cover. 80 ruled pages, elastic closure."),
        ("Unicorn Plush Journal", "Unicorn plush journal with gold-foil pages and ribbon bookmark. Gift-boxed."),
        ("Cat Plush Diary", "Tabby cat plush cover diary with lock and key. 100 lined pages, A5 size."),
    ],
    "cat-toys": [
        ("Catnip Plush Mouse Toy", "Plush mouse cat toy stuffed with organic catnip. Crinkle tail for extra stimulation."),
        ("Feather Wand Plush Bird", "Interactive feather wand with plush bird attachment. Replaceable feather tips."),
        ("Crinkle Fish Cat Toy", "Plush fish cat toy with crinkle fill and catnip pouch. Machine washable."),
        ("Rainbow Kicker Toy", "Long rainbow plush kicker toy for cats. Catnip-infused, bunny-kick size."),
    ],
    "dog-toys": [
        ("Squeaky Plush Hedgehog", "Plush hedgehog dog toy with internal squeaker. Reinforced seams for durability."),
        ("Rope & Plush Tug Toy", "Rope-and-plush combo tug toy. Chew-resistant for medium dogs."),
        ("Plush Squeaky Ball Dog Toy", "Soft plush ball with squeaker. Lightweight, great for indoor fetch."),
        ("Stuffed Bone Dog Plush", "Plush bone dog toy with multiple squeakers. XL size for large breeds."),
    ],
    "other-pet-supplies": [
        ("Rabbit Plush Tunnel Toy", "Crinkle plush tunnel toy for rabbits and guinea pigs. 50cm, two openings."),
        ("Hamster Plush Hideout", "Small animal plush hideout house. Soft interior, 15cm, ideal for hamsters."),
        ("Bird Plush Nest Toy", "Woven plush nest for small birds. Soft fabric with hanging hook."),
    ],
}

# Slug → product line id will be looked up at runtime


async def seed() -> None:
    async with async_session() as session:
        # Check if products already exist
        existing = (await session.execute(select(Product))).scalars().first()
        if existing:
            print("Products already exist. Truncating first...")
            from sqlalchemy import text
            await session.execute(text("DELETE FROM products"))
            await session.execute(text("ALTER SEQUENCE products_id_seq RESTART WITH 1"))
            await session.flush()

        # Load all product lines
        result = await session.execute(select(ProductLine))
        all_lines = {pl.slug: pl.id for pl in result.scalars().all()}
        print(f"Found {len(all_lines)} product lines in DB.")

        sku_counter = 1
        products_inserted = 0

        for slug, entries in LINE_CATALOGUE.items():
            pl_id = all_lines.get(slug)
            if not pl_id:
                print(f"  ⚠ Skipping '{slug}' — not found in DB")
                continue

            for i, (name, description) in enumerate(entries):
                sku = f"DS-{slug[:6].upper().replace('-', '')}-{sku_counter:04d}"
                price = Decimal(str(round(random.uniform(3.5, 89.0), 2)))
                moq = random.choice([50, 100, 200, 300, 500])
                is_featured = (i == 0)          # first item in each line is featured
                is_new = (sku_counter % 7 == 0) # every 7th is "new arrival"

                p = Product(
                    product_line_id=pl_id,
                    name=name,
                    sku=sku,
                    description=description,
                    detail_html=f"<p>{description}</p><ul><li>Material: {random.choice(MATERIALS)}</li><li>Size: {random.choice(SIZES)}</li><li>MOQ: {moq} pcs</li><li>{random.choice(CERTIFICATIONS)}</li></ul>",
                    main_image=None,
                    images=[],
                    price=price,
                    min_order_qty=moq,
                    material=random.choice(MATERIALS),
                    size=random.choice(SIZES),
                    weight=random.choice(WEIGHTS),
                    is_featured=is_featured,
                    is_new=is_new,
                    is_active=True,
                )
                session.add(p)
                sku_counter += 1
                products_inserted += 1

        await session.commit()
        print(f"✅ Done. Inserted {products_inserted} products.")


if __name__ == "__main__":
    asyncio.run(seed())
