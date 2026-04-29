import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { User, UserDocument } from './schemas/user.schema';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { QueryUserDto } from './dto/query-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name)
    private readonly userModel: Model<UserDocument>,
  ) {}

  async create(dto: CreateUserDto): Promise<User> {
    // Kiểm tra email trùng
    const existing = await this.userModel.findOne({ email: dto.email });
    if (existing) throw new ConflictException('Email đã tồn tại');

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(dto.password, salt);

    const { password, ...rest } = dto;
    return this.userModel.create({ ...rest, passwordHash });
  }

  async findAll(query: QueryUserDto) {
    const { page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc', search, role, isActive } = query;
    const skip = (page - 1) * limit;

    const filter: any = {};
    if (search) {
      filter.$or = [
        { fullName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }
    if (role) filter.role = role;
    if (isActive !== undefined) filter.isActive = isActive;

    const sort: any = { [sortBy]: sortOrder === 'asc' ? 1 : -1 };

    const [items, total] = await Promise.all([
      this.userModel.find(filter).sort(sort).skip(skip).limit(limit).lean(),
      this.userModel.countDocuments(filter),
    ]);

    return {
      items,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findById(id: string): Promise<User> {
    const user = await this.userModel.findById(id).lean();
    if (!user) throw new NotFoundException('Người dùng không tồn tại');
    return user;
  }

  async findByEmail(email: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ email }).select('+passwordHash');
  }

  async update(id: string, dto: UpdateUserDto): Promise<User> {
    const user = await this.userModel
      .findByIdAndUpdate(id, dto, { new: true, runValidators: true })
      .lean();
    if (!user) throw new NotFoundException('Người dùng không tồn tại');
    return user;
  }

  async remove(id: string): Promise<User> {
    const user = await this.userModel
      .findByIdAndUpdate(id, { isActive: false }, { new: true })
      .lean();
    if (!user) throw new NotFoundException('Người dùng không tồn tại');
    return user;
  }
}
