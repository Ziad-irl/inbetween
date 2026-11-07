import { Module } from '@nestjs/common';
import { CatalogController } from './catalog.controller';
import { CategoriesService } from './categories.service';
import { ListingsService } from './listings.service';

@Module({
  controllers: [CatalogController],
  providers: [CategoriesService, ListingsService],
  exports: [CategoriesService, ListingsService],
})
export class CatalogModule {}
