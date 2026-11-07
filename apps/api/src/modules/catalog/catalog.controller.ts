import { Controller, Get, Param, ParseUUIDPipe, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { listingSearchQuerySchema, type ListingSearchQuery } from '@inbetween/shared';
import { ZodValidationPipe } from '../../common/zod-validation.pipe';
import { CategoriesService } from './categories.service';
import { ListingsService } from './listings.service';

@ApiTags('catalog')
@Controller()
export class CatalogController {
  constructor(
    private readonly categories: CategoriesService,
    private readonly listings: ListingsService,
  ) {}

  @Get('categories')
  @ApiOperation({ summary: 'Active category tree (ar/en names, risk tiers)' })
  categoryTree() {
    return this.categories.tree();
  }

  @Get('listings')
  @ApiOperation({ summary: 'Search active listings' })
  search(@Query(new ZodValidationPipe(listingSearchQuerySchema)) query: ListingSearchQuery) {
    return this.listings.search(query);
  }

  @Get('listings/:id')
  @ApiOperation({ summary: 'Public listing details (approximate location)' })
  findOne(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.listings.findPublic(id);
  }
}
