import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Address, AddressDocument } from './schemas/address.schema';
import { CreateAddressDto } from './dto/create-address.dto';
import { UpdateAddressDto } from './dto/update-address.dto';

@Injectable()
export class AddressesService {
  constructor(
    @InjectModel(Address.name)
    private readonly addressModel: Model<AddressDocument>,
  ) {}

  async create(userId: string, dto: CreateAddressDto): Promise<Address> {
    // Nếu là địa chỉ mặc định → bỏ mặc định của các địa chỉ cũ
    if (dto.isDefault) {
      await this.addressModel.updateMany(
        { userId: new Types.ObjectId(userId), isDefault: true },
        { isDefault: false },
      );
    }

    // Nếu là địa chỉ đầu tiên → tự động set mặc định
    const count = await this.addressModel.countDocuments({
      userId: new Types.ObjectId(userId),
      isActive: true,
    });
    if (count === 0) dto.isDefault = true;

    return this.addressModel.create({
      ...dto,
      userId: new Types.ObjectId(userId),
    });
  }

  async findAllByUser(userId: string): Promise<Address[]> {
    return this.addressModel
      .find({ userId: new Types.ObjectId(userId), isActive: true })
      .sort({ isDefault: -1, createdAt: -1 })
      .lean();
  }

  async findById(id: string, userId: string): Promise<Address> {
    const address = await this.addressModel
      .findOne({ _id: id, userId: new Types.ObjectId(userId), isActive: true })
      .lean();
    if (!address) throw new NotFoundException('Địa chỉ không tồn tại');
    return address;
  }

  async update(
    id: string,
    userId: string,
    dto: UpdateAddressDto,
  ): Promise<Address> {
    const address = await this.addressModel
      .findOneAndUpdate(
        { _id: id, userId: new Types.ObjectId(userId) },
        dto,
        { new: true, runValidators: true },
      )
      .lean();
    if (!address) throw new NotFoundException('Địa chỉ không tồn tại');
    return address;
  }

  async setDefault(id: string, userId: string): Promise<Address> {
    // Bỏ mặc định tất cả
    await this.addressModel.updateMany(
      { userId: new Types.ObjectId(userId), isDefault: true },
      { isDefault: false },
    );

    // Set mặc định cho địa chỉ được chọn
    const address = await this.addressModel
      .findOneAndUpdate(
        { _id: id, userId: new Types.ObjectId(userId) },
        { isDefault: true },
        { new: true },
      )
      .lean();
    if (!address) throw new NotFoundException('Địa chỉ không tồn tại');
    return address;
  }

  async remove(id: string, userId: string): Promise<Address> {
    const address = await this.addressModel
      .findOneAndUpdate(
        { _id: id, userId: new Types.ObjectId(userId) },
        { isActive: false, isDefault: false },
        { new: true },
      )
      .lean();
    if (!address) throw new NotFoundException('Địa chỉ không tồn tại');
    return address;
  }
}
