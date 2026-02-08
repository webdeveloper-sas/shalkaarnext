import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { CreateUserDto, UpdateUserDto, UserResponseDto, UserQueryDto } from '../dtos/user.dto';
import { UserRole } from '../../../common/enums';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async getAllUsers(query: UserQueryDto): Promise<{ users: UserResponseDto[]; total: number }> {
    const skip = query.skip || 0;
    const take = query.take || 10;

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        skip,
        take,
        where: query.role ? { role: query.role } : undefined,
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          phone: true,
          role: true,
          createdAt: true,
          updatedAt: true,
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.user.count({
        where: query.role ? { role: query.role } : undefined,
      }),
    ]);

    return { users: users as UserResponseDto[], total };
  }

  async getUserById(id: string): Promise<UserResponseDto> {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return user;
  }

  async createUser(data: CreateUserDto): Promise<UserResponseDto> {
    try {
      const user = await this.prisma.user.create({
        data: {
          email: data.email,
          firstName: data.firstName,
          lastName: data.lastName,
          phone: data.phone,
          role: data.role || UserRole.CUSTOMER,
        },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          phone: true,
          role: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      return user;
    } catch (error) {
      if (error.code === 'P2002') {
        throw new BadRequestException(`Email already exists`);
      }
      throw error;
    }
  }

  async updateUser(id: string, data: UpdateUserDto): Promise<UserResponseDto> {
    const user = await this.getUserById(id); // Verify exists

    const updated = await this.prisma.user.update({
      where: { id },
      data: {
        firstName: data.firstName ?? user.firstName,
        lastName: data.lastName ?? user.lastName,
        phone: data.phone ?? user.phone,
        role: data.role ?? user.role,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return updated;
  }

  async deleteUser(id: string): Promise<{ success: boolean }> {
    await this.getUserById(id); // Verify exists

    await this.prisma.user.delete({
      where: { id },
    });

    return { success: true };
  }
}

