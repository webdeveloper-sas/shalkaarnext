import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { CreateCategoryDto, UpdateCategoryDto, CategoryResponseDto } from '../dtos/category.dto';

@Injectable()
export class CategoriesService {
  constructor(private readonly prisma: PrismaService) {}

  async getAllCategories(): Promise<CategoryResponseDto[]> {
    return this.prisma.category.findMany({
      select: {
        id: true,
        name: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { name: 'asc' },
    });
  }

  async getCategoryById(id: string): Promise<CategoryResponseDto> {
    const category = await this.prisma.category.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!category) {
      throw new NotFoundException(`Category with ID ${id} not found`);
    }

    return category;
  }

  async createCategory(data: CreateCategoryDto): Promise<CategoryResponseDto> {
    try {
      return await this.prisma.category.create({
        data: { name: data.name },
        select: {
          id: true,
          name: true,
          createdAt: true,
          updatedAt: true,
        },
      });
    } catch (error) {
      if (error.code === 'P2002') {
        throw new BadRequestException(`Category name "${data.name}" already exists`);
      }
      throw error;
    }
  }

  async updateCategory(id: string, data: UpdateCategoryDto): Promise<CategoryResponseDto> {
    await this.getCategoryById(id);

    try {
      return await this.prisma.category.update({
        where: { id },
        data: { name: data.name },
        select: {
          id: true,
          name: true,
          createdAt: true,
          updatedAt: true,
        },
      });
    } catch (error) {
      if (error.code === 'P2002') {
        throw new BadRequestException(`Category name "${data.name}" already exists`);
      }
      throw error;
    }
  }

  async deleteCategory(id: string): Promise<{ success: boolean }> {
    await this.getCategoryById(id);

    await this.prisma.category.delete({
      where: { id },
    });

    return { success: true };
  }
}
