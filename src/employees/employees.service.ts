import { Injectable, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Employee } from './entities/employee.entity.js';
import { InjectRepository } from '@nestjs/typeorm';
import { EmployeeCreateDto } from './dto/employee-create.dto.js';
import { EmployeeUpdateDto } from './dto/employee-update.dto.js';

@Injectable()
export class EmployeesService {
  constructor(
    @InjectRepository(Employee)
    private readonly employeeRepository: Repository<Employee>,
  ) {}

  async create(createEmployeeDto: EmployeeCreateDto) {
    const employee = this.employeeRepository.create(createEmployeeDto);
    await this.employeeRepository.save(employee);
    return {
      message: 'Employee Created Successfully',
    };
  }

  async findAll() {
    return this.employeeRepository.find();
  }

  async findById(id: number) {
    const employee = await this.employeeRepository.findOne({
      where: {
        id,
      },
    });

    if (!employee) {
      throw new NotFoundException('Employee Not Found!!!');
    }

    return employee;
  }

  async findByIdAndUpdate(id: number, employeeUpdateDto: EmployeeUpdateDto) {
    const employee = await this.findById(id);
    Object.assign(employee, employeeUpdateDto);
    await this.employeeRepository.save(employee);
    return {
      message: 'Employee Updated Successfully',
    };
  }

  async findByIdAndDelete(id: number) {
    const employee = await this.findById(id);
    await this.employeeRepository.remove(employee);
    return {
      message: 'Employee Deleted Successfully!!!',
    };
  }
}
