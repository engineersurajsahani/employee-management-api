import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class EmployeeUpdateDto {
  @IsOptional()
  @IsString()
  firstName: string;

  @IsOptional()
  @IsString()
  lastName: string;

  @IsOptional()
  @IsString()
  email: string;

  @IsOptional()
  @IsString()
  department: string;

  @IsOptional()
  @IsString()
  role: string;

  @IsOptional()
  @IsString()
  salary: string;

  @IsOptional()
  @IsBoolean()
  isActive:boolean;
}
