import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

export interface CategoryNode {
  id: string;
  slug: string;
  nameAr: string;
  nameEn: string;
  iconKey: string | null;
  riskTier: string;
  children: CategoryNode[];
}

@Injectable()
export class CategoriesService {
  constructor(private readonly prisma: PrismaService) {}

  /** Full active category tree, ordered for display. Small and cacheable (Redis in M1). */
  async tree(): Promise<CategoryNode[]> {
    const rows = await this.prisma.category.findMany({
      where: { isActive: true },
      orderBy: [{ sortOrder: 'asc' }, { nameEn: 'asc' }],
      select: {
        id: true,
        parentId: true,
        slug: true,
        nameAr: true,
        nameEn: true,
        iconKey: true,
        riskTier: true,
      },
    });

    const nodes = new Map<string, CategoryNode>();
    for (const { parentId: _parentId, ...row } of rows) {
      nodes.set(row.id, { ...row, children: [] });
    }

    const roots: CategoryNode[] = [];
    for (const row of rows) {
      const node = nodes.get(row.id)!;
      const parent = row.parentId ? nodes.get(row.parentId) : undefined;
      if (parent) parent.children.push(node);
      else roots.push(node);
    }
    return roots;
  }
}
