import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
  HttpCode,
} from '@nestjs/common';
import { UsersService } from '../services/users.service';
import { CreateUserDto, UpdateUserDto, UserResponseDto, UserQueryDto } from '../dtos/user.dto';
import { JwtAuthGuard, RolesGuard } from '../../../common/guards';
import { Roles, CurrentUser } from '../../../common/decorators';
import { UserRole } from '../../../common/enums';

@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @Roles(UserRole.ADMIN)
  async getAllUsers(@Query() query: UserQueryDto) {
    return this.usersService.getAllUsers(query);
  }

  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.CUSTOMER, UserRole.VENDOR)
  async getUserById(@Param('id') id: string, @CurrentUser() user: any): Promise<UserResponseDto> {
    // Allow users to view their own profile, admins can view anyone
    if (user.role !== UserRole.ADMIN && user.id !== id) {
      throw new Error('Forbidden');
    }
    return this.usersService.getUserById(id);
  }

  @Post()
  @Roles(UserRole.ADMIN)
  @HttpCode(201)
  async createUser(@Body() data: CreateUserDto): Promise<UserResponseDto> {
    return this.usersService.createUser(data);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN, UserRole.CUSTOMER, UserRole.VENDOR)
  async updateUser(
    @Param('id') id: string,
    @Body() data: UpdateUserDto,
    @CurrentUser() user: any,
  ): Promise<UserResponseDto> {
    // Allow users to update own profile, admins can update anyone
    if (user.role !== UserRole.ADMIN && user.id !== id) {
      throw new Error('Forbidden');
    }
    return this.usersService.updateUser(id, data);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @HttpCode(204)
  async deleteUser(@Param('id') id: string) {
    return this.usersService.deleteUser(id);
  }
}

