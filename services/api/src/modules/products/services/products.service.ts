import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { CreateProductDto, UpdateProductDto, ProductResponseDto, ProductQueryDto } from '../dtos/product.dto';

@Injectable()
export class ProductsService {
  constructor(private readonly prisma: PrismaService) {}

  async getAllProducts(query: ProductQueryDto): Promise<{ products: ProductResponseDto[]; total: number }> {
    const skip = query.skip || 0;
    const take = query.take || 10;

    const [products, total] = await Promise.all([
      this.prisma.product.findMany({
        skip,
        take,
        where: query.categoryId ? { categoryId: query.categoryId } : undefined,
        select: {
          id: true,
          name: true,
          description: true,
          basePrice: true,
          categoryId: true,
          createdAt: true,
          updatedAt: true,
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.product.count({
        where: query.categoryId ? { categoryId: query.categoryId } : undefined,
      }),
    ]);

    return {
      products: products.map((p) => ({
        ...p,
        basePrice: Number(p.basePrice),
      })) as ProductResponseDto[],
      total,
    };
  }

  async getProductById(id: string): Promise<ProductResponseDto> {
    const product = await this.prisma.product.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        description: true,
        basePrice: true,
        categoryId: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }

    return {
      ...product,
      basePrice: Number(product.basePrice),
    };
  }

  async createProduct(data: CreateProductDto): Promise<ProductResponseDto> {
    const product = await this.prisma.product.create({
      data: {
        name: data.name,
        description: data.description,
        basePrice: data.basePrice,
        categoryId: data.categoryId,
      },
      select: {
        id: true,
        name: true,
        description: true,
        basePrice: true,
        categoryId: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return {
      ...product,
      basePrice: Number(product.basePrice),
    };
  }

  async updateProduct(id: string, data: UpdateProductDto): Promise<ProductResponseDto> {
    const product = await this.getProductById(id);

    const updated = await this.prisma.product.update({
      where: { id },
      data: {
        name: data.name ?? product.name,
        description: data.description ?? product.description,
        basePrice: data.basePrice ?? product.basePrice,
        categoryId: data.categoryId ?? product.categoryId,
      },
      select: {
        id: true,
        name: true,
        description: true,
        basePrice: true,
        categoryId: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return {
      ...updated,
      basePrice: Number(updated.basePrice),
    };
  }

  async deleteProduct(id: string): Promise<{ success: boolean }> {
    await this.getProductById(id);

    await this.prisma.product.delete({
      where: { id },
    });

    return { success: true };
  }
}
