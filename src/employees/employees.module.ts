import { Module } from '@nestjs/common';
import { EmployeesController } from './employees.controller.js';
import { EmployeesService } from './employees.service.js';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Employee } from './entities/employee.entity.js';

@Module({
  imports:[
    TypeOrmModule.forFeature([Employee])
  ],
  controllers: [EmployeesController],
  providers: [EmployeesService]
})
export class EmployeesModule {}
