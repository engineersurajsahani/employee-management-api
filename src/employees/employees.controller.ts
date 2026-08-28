import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post } from '@nestjs/common';
import { EmployeesService } from './employees.service.js';
import { EmployeeCreateDto } from './dto/employee-create.dto.js';
import { EmployeeUpdateDto } from './dto/employee-update.dto.js';

@Controller('employees')
export class EmployeesController {
  constructor(private readonly employeeService: EmployeesService) {}

  @Post()
  async create(@Body() createEmployeeDto: EmployeeCreateDto) {
    return this.employeeService.create(createEmployeeDto);
  }

  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateEmployeeDto: EmployeeUpdateDto,
  ) {
    return this.employeeService.findByIdAndUpdate(id, updateEmployeeDto);
  }

  @Get()
  async find() {
    return this.employeeService.findAll();
  }

  @Get(':id')
  async findById(@Param('id', ParseIntPipe) id: number) {
    return this.employeeService.findById(id);
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    return this.employeeService.findByIdAndDelete(id);
  }
}
