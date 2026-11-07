// Seeds the category tree: from a needle (LOW) to a rocket (RESTRICTED).
// Idempotent: safe to run repeatedly.
import { PrismaClient, type RiskTier } from '@prisma/client';

interface SeedChild {
  slug: string;
  nameEn: string;
  nameAr: string;
  /** Defaults to the parent's tier. */
  riskTier?: RiskTier;
}

interface SeedCategory extends SeedChild {
  riskTier: RiskTier;
  children?: SeedChild[];
}

const categories: SeedCategory[] = [
  {
    slug: 'sewing-crafts',
    nameEn: 'Sewing & Crafts',
    nameAr: 'الخياطة والحرف اليدوية',
    riskTier: 'LOW',
    children: [
      { slug: 'sewing-machines', nameEn: 'Sewing machines', nameAr: 'ماكينات خياطة' },
      { slug: 'craft-tools', nameEn: 'Needles & craft tools', nameAr: 'إبر وأدوات الحرف' },
    ],
  },
  {
    slug: 'tools-diy',
    nameEn: 'Tools & DIY',
    nameAr: 'العدد والأدوات',
    riskTier: 'LOW',
    children: [
      { slug: 'power-tools', nameEn: 'Power tools', nameAr: 'عدد كهربائية' },
      { slug: 'ladders', nameEn: 'Ladders & scaffolding', nameAr: 'سلالم وسقالات' },
    ],
  },
  {
    slug: 'electronics',
    nameEn: 'Electronics',
    nameAr: 'إلكترونيات',
    riskTier: 'MEDIUM',
    children: [
      { slug: 'cameras', nameEn: 'Cameras & lenses', nameAr: 'كاميرات وعدسات' },
      { slug: 'laptops', nameEn: 'Laptops & tablets', nameAr: 'لابتوب وتابلت' },
      { slug: 'gaming', nameEn: 'Gaming consoles', nameAr: 'أجهزة ألعاب' },
      { slug: 'audio', nameEn: 'Sound systems', nameAr: 'أنظمة صوت' },
    ],
  },
  {
    slug: 'outdoor-camping',
    nameEn: 'Outdoor & Camping',
    nameAr: 'رحلات وتخييم',
    riskTier: 'LOW',
    children: [
      { slug: 'tents', nameEn: 'Tents', nameAr: 'خيام' },
      { slug: 'bikes', nameEn: 'Bicycles', nameAr: 'دراجات', riskTier: 'MEDIUM' },
    ],
  },
  {
    slug: 'events-party',
    nameEn: 'Events & Party',
    nameAr: 'مناسبات وحفلات',
    riskTier: 'LOW',
    children: [
      { slug: 'furniture-decor', nameEn: 'Furniture & decor', nameAr: 'أثاث وديكور' },
      { slug: 'lighting-stage', nameEn: 'Lighting & stage', nameAr: 'إضاءة ومسارح', riskTier: 'MEDIUM' },
    ],
  },
  {
    slug: 'vehicles',
    nameEn: 'Vehicles',
    nameAr: 'مركبات',
    riskTier: 'HIGH',
    children: [
      { slug: 'cars', nameEn: 'Cars', nameAr: 'سيارات' },
      { slug: 'motorcycles', nameEn: 'Motorcycles & scooters', nameAr: 'موتوسيكلات وسكوترات' },
    ],
  },
  {
    slug: 'heavy-equipment',
    nameEn: 'Heavy Equipment',
    nameAr: 'معدات ثقيلة',
    riskTier: 'HIGH',
    children: [
      { slug: 'generators', nameEn: 'Generators', nameAr: 'مولدات كهرباء' },
      { slug: 'construction-machinery', nameEn: 'Construction machinery', nameAr: 'معدات بناء', riskTier: 'RESTRICTED' },
    ],
  },
  {
    slug: 'aviation-marine',
    nameEn: 'Aviation, Marine & Aerospace',
    nameAr: 'طيران وبحرية وفضاء',
    riskTier: 'RESTRICTED',
    children: [
      { slug: 'boats', nameEn: 'Boats & yachts', nameAr: 'قوارب ويخوت' },
      { slug: 'drones', nameEn: 'Professional drones', nameAr: 'طائرات درون احترافية', riskTier: 'HIGH' },
      { slug: 'aerospace', nameEn: 'Aircraft & rockets', nameAr: 'طائرات وصواريخ' },
    ],
  },
];

async function main() {
  const prisma = new PrismaClient();
  try {
    let order = 0;
    for (const root of categories) {
      const parent = await prisma.category.upsert({
        where: { slug: root.slug },
        update: { nameEn: root.nameEn, nameAr: root.nameAr, riskTier: root.riskTier, sortOrder: order },
        create: { slug: root.slug, nameEn: root.nameEn, nameAr: root.nameAr, riskTier: root.riskTier, sortOrder: order },
      });
      order += 10;

      let childOrder = 0;
      for (const child of root.children ?? []) {
        const data = {
          nameEn: child.nameEn,
          nameAr: child.nameAr,
          riskTier: child.riskTier ?? root.riskTier,
          sortOrder: childOrder,
          parentId: parent.id,
        };
        await prisma.category.upsert({
          where: { slug: child.slug },
          update: data,
          create: { slug: child.slug, ...data },
        });
        childOrder += 10;
      }
    }
    console.warn(`Seeded ${categories.length} root categories.`);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
