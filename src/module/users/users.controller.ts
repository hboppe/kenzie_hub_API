import { Controller, Post, Get, Param, Put, Body, Delete, HttpCode, Patch } from '@nestjs/common';
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
  findOne(@Param('id') id: string){
    return this.usersService.findOne(id)
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updatedData: UpdateUserDTO){
    return this.usersService.update(id, updatedData)
  }

  @HttpCode(204)
  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.usersService.delete(id)
  }

}
