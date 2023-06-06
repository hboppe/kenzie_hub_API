import { Controller, Post, Get, Param, Put, Body, Delete, HttpCode } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDTO } from './dto/create-user.dto';
import { UpdateUserDTO } from './dto/update-user.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  create(@Body() userData: CreateUserDTO) {
    return this.usersService.create(userData)
  }

  @Get()
  findAll(){
    return this.usersService.findAll()
  }

  @Get(':id')
  findOne(@Param() params: any){
    return this.usersService.findOne(params.id)
  }

  @Put(':id')
  update(@Param() params: any, @Body() updatedInfo: UpdateUserDTO){
    return this.usersService.update(params.id, updatedInfo)
  }

  @HttpCode(204)
  @Delete(':id')
  delete(@Param() params: any) {
    return this.usersService.delete(params.id)
  }

}
