import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './schemas/user.schema';
import { Address, AddressSchema } from './schemas/address.schema';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { AddressesService } from './addresses.service';
import { AddressesController } from './addresses.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Address.name, schema: AddressSchema },
    ]),
  ],
  controllers: [UsersController, AddressesController],
  providers: [UsersService, AddressesService],
  exports: [UsersService, AddressesService],
})
export class UsersModule {}
