"""Seed script to populate the database with sample plush toy data."""
import asyncio
from decimal import Decimal

from sqlalchemy import text

from app.database import Base, async_session, engine
from app.models.banner import Banner
from app.models.product import Product
from app.models.product_line import ProductLine
from app.models.user import User, UserRole
from app.utils.auth import hash_password

PRODUCT_LINES = [
    {"name": "经典动物系列", "slug": "classic-animals", "description": "最受欢迎的经典动物毛绒玩具，包括熊、兔、狗等经典造型，适合各年龄段。采用优质短毛绒面料，手感柔软细腻。", "sort_order": 1},
    {"name": "海洋生物系列", "slug": "ocean-creatures", "description": "来自深海的可爱伙伴，包含鲸鱼、海豚、章鱼、海龟等海洋动物，色彩鲜艳，造型独特。", "sort_order": 2},
    {"name": "森林萌宠系列", "slug": "forest-friends", "description": "以森林动物为主题的毛绒玩具系列，包括松鼠、狐狸、小鹿、浣熊等，自然配色，充满野趣。", "sort_order": 3},
    {"name": "卡通IP联名系列", "slug": "cartoon-ip", "description": "与知名卡通IP合作的联名系列，经典角色毛绒化，高还原度设计，深受粉丝喜爱。", "sort_order": 4},
    {"name": "节日主题系列", "slug": "holiday-collection", "description": "针对圣诞、情人节、万圣节等重要节日设计的限定款毛绒玩具，节日氛围浓厚，是送礼佳品。", "sort_order": 5},
    {"name": "婴幼儿安抚系列", "slug": "baby-comfort", "description": "专为0-3岁婴幼儿设计的安抚毛绒玩具，通过安全认证，超柔面料，无小零件，可机洗。", "sort_order": 6},
    {"name": "巨型毛绒系列", "slug": "giant-plush", "description": "超大尺寸的毛绒玩具，从80cm到200cm不等，适合家居装饰和商场展示，视觉冲击力强。", "sort_order": 7},
    {"name": "功能互动系列", "slug": "interactive-plush", "description": "内置电子模块的互动毛绒玩具，支持发声、录音、触摸回应等功能，增加玩乐趣味性。", "sort_order": 8},
]

PRODUCTS = [
    # 经典动物系列
    {"product_line_slug": "classic-animals", "name": "经典泰迪熊 - 棕色", "sku": "CA-001", "description": "经典款棕色泰迪熊，采用高密度PP棉填充，柔软蓬松。", "price": Decimal("8.50"), "min_order_qty": 100, "material": "短毛绒+PP棉", "size": "30cm", "weight": "200g", "is_featured": True, "is_new": False},
    {"product_line_slug": "classic-animals", "name": "经典泰迪熊 - 白色", "sku": "CA-002", "description": "纯白色泰迪熊，适合婚庆和礼品市场。", "price": Decimal("8.50"), "min_order_qty": 100, "material": "短毛绒+PP棉", "size": "30cm", "weight": "200g", "is_featured": False, "is_new": False},
    {"product_line_slug": "classic-animals", "name": "垂耳兔公仔", "sku": "CA-003", "description": "可爱垂耳兔造型，长耳朵设计，多色可选。", "price": Decimal("6.80"), "min_order_qty": 200, "material": "水晶超柔+PP棉", "size": "25cm", "weight": "150g", "is_featured": True, "is_new": True},
    {"product_line_slug": "classic-animals", "name": "柯基犬毛绒公仔", "sku": "CA-004", "description": "呆萌柯基犬造型，屁股超可爱，社交媒体爆款。", "price": Decimal("9.20"), "min_order_qty": 100, "material": "短毛绒+PP棉", "size": "35cm", "weight": "250g", "is_featured": True, "is_new": True},
    {"product_line_slug": "classic-animals", "name": "趴趴猫抱枕", "sku": "CA-005", "description": "慵懒趴趴猫造型，可作抱枕使用，实用性强。", "price": Decimal("7.50"), "min_order_qty": 150, "material": "弹力超柔+PP棉", "size": "40cm", "weight": "300g", "is_featured": False, "is_new": False},
    {"product_line_slug": "classic-animals", "name": "小羊驼公仔", "sku": "CA-006", "description": "呆萌羊驼造型，蓬松毛发设计，手感极佳。", "price": Decimal("10.50"), "min_order_qty": 100, "material": "长毛绒+PP棉", "size": "35cm", "weight": "280g", "is_featured": False, "is_new": True},
    # 海洋生物系列
    {"product_line_slug": "ocean-creatures", "name": "蓝色大鲸鱼", "sku": "OC-001", "description": "流线型鲸鱼造型，渐变蓝色设计，适合海洋主题装饰。", "price": Decimal("12.00"), "min_order_qty": 80, "material": "水晶超柔+PP棉", "size": "50cm", "weight": "400g", "is_featured": True, "is_new": False},
    {"product_line_slug": "ocean-creatures", "name": "章鱼翻转公仔", "sku": "OC-002", "description": "双面表情章鱼，可翻转切换开心/生气表情，TikTok爆款。", "price": Decimal("4.50"), "min_order_qty": 500, "material": "短毛绒+PP棉", "size": "20cm", "weight": "100g", "is_featured": True, "is_new": False},
    {"product_line_slug": "ocean-creatures", "name": "海龟宝宝", "sku": "OC-003", "description": "可爱海龟造型，龟壳可拆卸清洗，环保理念设计。", "price": Decimal("7.80"), "min_order_qty": 150, "material": "短毛绒+PP棉", "size": "30cm", "weight": "200g", "is_featured": False, "is_new": True},
    {"product_line_slug": "ocean-creatures", "name": "粉色海豚", "sku": "OC-004", "description": "梦幻粉色海豚，柔软弹性体，可作颈枕使用。", "price": Decimal("8.00"), "min_order_qty": 100, "material": "弹力超柔+PP棉", "size": "45cm", "weight": "250g", "is_featured": False, "is_new": False},
    {"product_line_slug": "ocean-creatures", "name": "小丑鱼尼莫", "sku": "OC-005", "description": "橙白条纹小丑鱼，色彩鲜艳，深受儿童喜爱。", "price": Decimal("5.50"), "min_order_qty": 200, "material": "短毛绒+PP棉", "size": "25cm", "weight": "120g", "is_featured": False, "is_new": True},
    # 森林萌宠系列
    {"product_line_slug": "forest-friends", "name": "小狐狸先生", "sku": "FF-001", "description": "绅士狐狸造型，戴领结设计，橙白配色经典。", "price": Decimal("9.80"), "min_order_qty": 100, "material": "短毛绒+PP棉", "size": "35cm", "weight": "250g", "is_featured": True, "is_new": True},
    {"product_line_slug": "forest-friends", "name": "松鼠小可爱", "sku": "FF-002", "description": "蓬松大尾巴松鼠，怀抱松果配件，自然风格。", "price": Decimal("7.20"), "min_order_qty": 150, "material": "长毛绒+PP棉", "size": "28cm", "weight": "180g", "is_featured": False, "is_new": False},
    {"product_line_slug": "forest-friends", "name": "梅花鹿宝宝", "sku": "FF-003", "description": "温柔梅花鹿造型，斑点刺绣工艺，精致细腻。", "price": Decimal("11.00"), "min_order_qty": 80, "material": "短毛绒+PP棉", "size": "40cm", "weight": "300g", "is_featured": True, "is_new": False},
    {"product_line_slug": "forest-friends", "name": "浣熊探险家", "sku": "FF-004", "description": "戴帽子的浣熊探险家，背包配件可拆卸。", "price": Decimal("10.50"), "min_order_qty": 100, "material": "短毛绒+PP棉", "size": "32cm", "weight": "220g", "is_featured": False, "is_new": True},
    # 卡通IP联名系列
    {"product_line_slug": "cartoon-ip", "name": "恐龙宝贝 - 绿色", "sku": "CI-001", "description": "超萌小恐龙造型，圆润体型设计，多色系可选。", "price": Decimal("7.00"), "min_order_qty": 200, "material": "水晶超柔+PP棉", "size": "30cm", "weight": "200g", "is_featured": True, "is_new": False},
    {"product_line_slug": "cartoon-ip", "name": "独角兽公主", "sku": "CI-002", "description": "梦幻独角兽造型，彩虹鬃毛，闪光角设计。", "price": Decimal("11.50"), "min_order_qty": 100, "material": "长毛绒+PP棉", "size": "38cm", "weight": "280g", "is_featured": True, "is_new": True},
    {"product_line_slug": "cartoon-ip", "name": "太空熊猫", "sku": "CI-003", "description": "穿宇航服的熊猫，太空主题设计，科技感十足。", "price": Decimal("13.00"), "min_order_qty": 80, "material": "短毛绒+PP棉", "size": "35cm", "weight": "300g", "is_featured": False, "is_new": True},
    # 节日主题系列
    {"product_line_slug": "holiday-collection", "name": "圣诞麋鹿", "sku": "HC-001", "description": "红鼻子麋鹿，戴圣诞帽和围巾，节日装饰必备。", "price": Decimal("8.80"), "min_order_qty": 200, "material": "短毛绒+PP棉", "size": "30cm", "weight": "200g", "is_featured": True, "is_new": False},
    {"product_line_slug": "holiday-collection", "name": "情人节爱心熊", "sku": "HC-002", "description": "抱红色爱心的白色小熊，情人节畅销款。", "price": Decimal("6.50"), "min_order_qty": 300, "material": "短毛绒+PP棉", "size": "25cm", "weight": "150g", "is_featured": False, "is_new": False},
    {"product_line_slug": "holiday-collection", "name": "万圣节南瓜猫", "sku": "HC-003", "description": "黑猫抱南瓜造型，万圣节限定设计。", "price": Decimal("7.50"), "min_order_qty": 200, "material": "短毛绒+PP棉", "size": "28cm", "weight": "180g", "is_featured": False, "is_new": True},
    # 婴幼儿安抚系列
    {"product_line_slug": "baby-comfort", "name": "安抚兔兔巾", "sku": "BC-001", "description": "柔软安抚巾+兔子头设计，通过CE/CPC认证，可机洗。", "price": Decimal("3.80"), "min_order_qty": 500, "material": "婴幼儿级超柔+PP棉", "size": "30cm", "weight": "80g", "is_featured": True, "is_new": False},
    {"product_line_slug": "baby-comfort", "name": "安抚小象音乐盒", "sku": "BC-002", "description": "拉绳播放摇篮曲的小象，安抚入睡神器。", "price": Decimal("8.50"), "min_order_qty": 100, "material": "婴幼儿级超柔+PP棉+电子模块", "size": "25cm", "weight": "180g", "is_featured": True, "is_new": True},
    {"product_line_slug": "baby-comfort", "name": "彩虹叠叠圈", "sku": "BC-003", "description": "毛绒叠叠乐玩具，多种材质触感，锻炼抓握能力。", "price": Decimal("6.00"), "min_order_qty": 200, "material": "多种面料+PP棉", "size": "25cm", "weight": "150g", "is_featured": False, "is_new": True},
    # 巨型毛绒系列
    {"product_line_slug": "giant-plush", "name": "巨型泰迪熊 100cm", "sku": "GP-001", "description": "100cm大号泰迪熊，适合家居装饰和商场展示。", "price": Decimal("35.00"), "min_order_qty": 20, "material": "短毛绒+PP棉", "size": "100cm", "weight": "2000g", "is_featured": True, "is_new": False},
    {"product_line_slug": "giant-plush", "name": "巨型泰迪熊 160cm", "sku": "GP-002", "description": "160cm超大泰迪熊，抱抱熊经典款。", "price": Decimal("65.00"), "min_order_qty": 10, "material": "短毛绒+PP棉", "size": "160cm", "weight": "4500g", "is_featured": False, "is_new": False},
    {"product_line_slug": "giant-plush", "name": "巨型独角兽 120cm", "sku": "GP-003", "description": "120cm梦幻独角兽，可骑坐设计，彩虹配色。", "price": Decimal("48.00"), "min_order_qty": 15, "material": "长毛绒+PP棉", "size": "120cm", "weight": "3000g", "is_featured": True, "is_new": True},
    # 功能互动系列
    {"product_line_slug": "interactive-plush", "name": "会说话的鹦鹉", "sku": "IP-001", "description": "录音复读鹦鹉，按翅膀录音，松开播放变声版本。", "price": Decimal("5.50"), "min_order_qty": 200, "material": "短毛绒+PP棉+电子模块", "size": "20cm", "weight": "150g", "is_featured": True, "is_new": False},
    {"product_line_slug": "interactive-plush", "name": "发光星空兔", "sku": "IP-002", "description": "按肚子投射星空灯光效果，USB充电，安抚助眠。", "price": Decimal("12.00"), "min_order_qty": 80, "material": "短毛绒+PP棉+LED模块", "size": "30cm", "weight": "250g", "is_featured": False, "is_new": True},
    {"product_line_slug": "interactive-plush", "name": "跳舞仙人掌", "sku": "IP-003", "description": "会跳舞、唱歌、录音的仙人掌，120首歌曲内置。", "price": Decimal("6.00"), "min_order_qty": 300, "material": "短毛绒+PP棉+电子模块", "size": "32cm", "weight": "200g", "is_featured": True, "is_new": False},
]


async def seed():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

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
                Banner(tag="全新上市", title="超柔绒面系列", subtitle="采用高级长绒面料，触感细腻柔软\nOEM/ODM 定制，最低起订量 500 件", cta_text="立即询盘", cta_link="/inquiry", bg_gradient="from-rose-50 via-pink-50 to-amber-50", sort_order=1, is_active=True),
                Banner(tag="爆款推荐", title="经典动物毛绒玩具", subtitle="熊猫、兔子、狐狸……百余款选择\n通过 CE、CPC、ASTM 安全认证", cta_text="浏览产品", cta_link="/products?is_featured=true", bg_gradient="from-purple-50 via-violet-50 to-pink-50", sort_order=2, is_active=True),
                Banner(tag="工厂直供", title="十余年出口经验", subtitle="出口欧美、日韩等 50+ 国家\n从打样到量产，全流程服务", cta_text="了解我们", cta_link="/about", bg_gradient="from-amber-50 via-orange-50 to-rose-50", sort_order=3, is_active=True),
            ]
            session.add_all(default_banners)

        await session.commit()
        print(f"Seeded {len(PRODUCT_LINES)} product lines, {len(PRODUCTS)} products, 2 users.")
        print("Admin: admin@plushtoy.com / admin123")
        print("Demo client: demo@client.com / demo123")


if __name__ == "__main__":
    asyncio.run(seed())
