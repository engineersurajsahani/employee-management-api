# Employee Management REST API (NestJS + PostgreSQL + TypeORM + JWT + Docker)

Yeh ek complete, industry-standard **NestJS Backend REST API** project hai jisme:
- **Authentication:** User Registration aur Login with `bcrypt` password hashing aur `JWT (JSON Web Token)` generation.
- **Route Protection:** Custom `AuthMiddleware` jo `Bearer <token>` ko verify karke `Employees` APIs ko protect karta hai.
- **Employee CRUD:** Create, Read (All & By ID), Update, aur Delete operations.
- **Database & ORM:** PostgreSQL running inside a **Docker container**, integrated using **TypeORM**.
- **Data Validation:** Strict DTO validation using `class-validator` aur `class-transformer` via global `ValidationPipe`.
- **Configuration:** Environment variables managed via `@nestjs/config`.

---

## Table of Contents
1. [Tech Stack & Architecture](#1-tech-stack--architecture)
2. [Project Directory Structure](#2-project-directory-structure)
3. [Prerequisites](#3-prerequisites)
4. [Step-by-Step Setup & Run Guide (Commands)](#4-step-by-step-setup--run-guide-commands)
5. [Code & File-by-File Explanation (Kya Code Hai Aur Kyu Hai)](#5-code--file-by-file-explanation-kya-code-hai-aur-kyu-hai)
   - [Step 1: Docker & PostgreSQL Setup](#step-1-docker--postgresql-setup)
   - [Step 2: Environment Configuration (`.env`)](#step-2-environment-configuration-env)
   - [Step 3: Database Module (`database.module.ts`)](#step-3-database-module-databasemodulets)
   - [Step 4: Users Module & Entity (`users`)](#step-4-users-module--entity-users)
   - [Step 5: Auth Module, JWT & Middleware (`auth`)](#step-5-auth-module-jwt--middleware-auth)
   - [Step 6: Employees Module & CRUD (`employees`)](#step-6-employees-module--crud-employees)
   - [Step 7: Main & Global App Module (`main.ts` & `app.module.ts`)](#step-7-main--global-app-module-maints--appmodulets)
6. [Complete API Documentation (Input / Output / cURL)](#6-complete-api-documentation)
7. [Postman Testing Workflow](#7-postman-testing-workflow)
8. [Common Errors & Troubleshooting](#8-common-errors--troubleshooting)

---

## 1. Tech Stack & Architecture

| Technology | Purpose |
|---|---|
| **NestJS 12** | Progressive Node.js framework for scalable server-side applications |
| **TypeScript** | Type safety, clean interfaces, and OOP support |
| **PostgreSQL 16** | Relational Database running in Docker |
| **TypeORM** | Object-Relational Mapper to interact with PostgreSQL using TypeScript classes |
| **@nestjs/jwt & jsonwebtoken** | Generating and verifying secure JWT tokens |
| **bcrypt** | Hashing passwords with 10 salt rounds before storing in the database |
| **class-validator & class-transformer** | Validating and sanitizing incoming request bodies |
| **Docker & Docker Compose** | Isolated PostgreSQL container management |

### Request Lifecycle Architecture

```text
               HTTP REQUEST FROM CLIENT
                          │
                          ▼
                  main.ts (ValidationPipe)
                          │
                          ▼
                     AppModule
                          │
                          ├──────────────────────────────┐
                          ▼                              ▼
                 Public Routes (/auth)       Protected Routes (/employees)
                          │                              │
                          │                     AuthMiddleware
                          │            (Validates Authorization: Bearer JWT)
                          │                              │
                          ▼                              ▼
                   AuthController                EmployeesController
                          │                              │
                          ▼                              ▼
                     AuthService                  EmployeesService
                          │                              │
                          ▼                              ▼
                  UsersRepository                EmployeeRepository
                          │                              │
                          └──────────────┬───────────────┘
                                         ▼
                               TypeORM (PostgreSQL)
                                         │
                                         ▼
                           Docker Container (Port 5435)
```

---

## 2. Project Directory Structure

```text
employee-management-api/
│
├── src/
│   ├── auth/                               # Authentication & Security Module
│   │   ├── dto/
│   │   │   ├── login.dto.ts                # DTO for login validation
│   │   │   └── register.dto.ts             # DTO for registration validation
│   │   ├── auth.controller.ts              # /auth/register & /auth/login endpoints
│   │   ├── auth.middleware.ts              # Middleware to verify Bearer JWT token
│   │   ├── auth.module.ts                  # AuthModule exporting AuthService & JwtModule
│   │   └── auth.service.ts                 # Password hashing, verification & JWT signing
│   │
│   ├── users/                              # User Domain Module
│   │   ├── entities/
│   │   │   └── user.entity.ts              # TypeORM User table entity
│   │   ├── users.module.ts                 # Exports UsersService and User repository
│   │   └── users.service.ts                # DB queries for Users (find, create)
│   │
│   ├── employees/                          # Employees CRUD Domain Module
│   │   ├── dto/
│   │   │   ├── employee-create.dto.ts      # DTO for employee creation
│   │   │   └── employee-update.dto.ts      # DTO for employee partial update
│   │   ├── entities/
│   │   │   └── employee.entity.ts          # TypeORM Employee table entity
│   │   ├── employees.controller.ts         # REST API endpoints for employees
│   │   ├── employees.module.ts             # EmployeesModule registration
│   │   └── employees.service.ts            # CRUD logic via TypeORM Repository
│   │
│   ├── database/
│   │   └── database.module.ts              # Async PostgreSQL TypeORM connection setup
│   │
│   ├── app.controller.ts                   # Root health check controller
│   ├── app.module.ts                       # Root module wiring all modules & middleware
│   ├── app.service.ts                      # Root service
│   └── main.ts                             # Application entry point with ValidationPipe
│
├── .env                                    # Local environment secrets (not in git)
├── .env.example                            # Template for environment variables
├── .gitignore                              # Git ignore rules
├── Dockerfile                              # Multi-stage production container build
├── docker-compose.yml                      # PostgreSQL container specification
├── package.json                            # Dependencies and scripts
├── tsconfig.json                           # TypeScript compiler configuration
└── README.md                               # Project documentation
```

---

## 3. Prerequisites

Make sure the following tools are installed on your machine:
1. **Node.js**: v18+ or v20+ or v22+ (`node -v`)
2. **npm**: v9+ (`npm -v`)
3. **Docker Desktop**: (`docker -v` and `docker compose version`)
4. **Postman / Thunder Client / cURL**: For API testing

---

## 4. Step-by-Step Setup & Run Guide (Commands)

### Step 1: Clone or Navigate to Project
```bash
cd "employee-management-api"
```

### Step 2: Install Project Dependencies
```bash
npm install
```

### Step 3: Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
# Windows PowerShell
copy .env.example .env

# Git Bash / Linux / macOS
cp .env.example .env
```

Ensure your `.env` contains:
```env
APP_PORT=3000

DB_HOST=localhost
DB_PORT=5435
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_NAME=employee_db

JWT_SECRET=itm
JWT_EXPIRES_IN=1d
```

### Step 4: Start PostgreSQL with Docker Compose
```bash
docker compose up -d
```
Verify the container is running:
```bash
docker ps
```
*Output will show `employee_postgres` listening on port `0.0.0.0:5435->5432/tcp`.*

### Step 5: Start NestJS Development Server
```bash
npm run start:dev
```
Terminal output should confirm:
```text
[Nest] LOG [NestFactory] Starting Nest application...
[Nest] LOG [InstanceLoader] DatabaseModule dependencies initialized
[Nest] LOG [InstanceLoader] TypeOrmCoreModule dependencies initialized
[Nest] LOG [NestApplication] Nest application successfully started
```
Your API is now running at: `http://localhost:3000`!

---

## 5. Code & File-by-File Explanation (Kya Code Hai Aur Kyu Hai)

---

### Step 1: Docker & PostgreSQL Setup
#### File: `docker-compose.yml`

```yaml
services:
  postgres:
    image: postgres:16
    container_name: employee_postgres
    restart: unless-stopped
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: employee_db
    ports:
      - "5435:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

#### Kyu likha hai:
1. **Isolated Environment:** Local machine par PostgreSQL install karne ki zarurat nahi hoti. Ek single command `docker compose up -d` se database ready ho jata hai.
2. **Port `5435:5432`:** Container ke andar PostgreSQL default `5432` par chalta hai, lekin host machine par conflict avoid karne ke liye humne host port `5435` bind kiya hai.
3. **Data Persistence (`volumes`):** `postgres_data` volume yeh ensure karta hai ki jab container stop/restart ho, database ka data delete na ho.

---

### Step 2: Environment Configuration (`.env`)
#### File: `.env`

```env
APP_PORT=3000
DB_HOST=localhost
DB_PORT=5435
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_NAME=employee_db
JWT_SECRET=itm
JWT_EXPIRES_IN=1d
```

#### Kyu likha hai:
- Database credentials aur JWT secrets ko code ke andar hardcode karna security risk hota hai.
- Environment variables se different environments (Development, Staging, Production) me bina code change kiye configurations badli ja sakti hain.

---

### Step 3: Database Module (`database.module.ts`)
#### File: `src/database/database.module.ts`

```typescript
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('DB_HOST'),
        port: configService.get<number>('DB_PORT'),
        username: configService.get<string>('DB_USERNAME'),
        password: configService.get<string>('DB_PASSWORD'),
        database: configService.get<string>('DB_NAME'),
        autoLoadEntities: true,
        synchronize: true, // Development only: Auto creates tables from entities
      }),
    }),
  ],
})
export class DatabaseModule {}
```

#### Kyu likha hai:
1. **`forRootAsync` + `ConfigService`:** Database connection `.env` load hone ke baad async tarike se initialize hota hai.
2. **`autoLoadEntities: true`:** Har entity ko manually list karne ki zarurat nahi hoti.
3. **`synchronize: true`:** Development mode me TypeScript entities ke base par PostgreSQL tables automatically create/update ho jaate hain. *(Note: Production me ise `false` karke TypeORM Migrations use karte hain).*

---

### Step 4: Users Module & Entity (`users`)

#### File 1: `src/users/entities/user.entity.ts`
```typescript
import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100 })
  name: string;

  @Column({ length: 100, unique: true })
  username: string;

  @Column({ length: 150, unique: true })
  email: string;

  @Column()
  password: string; // Stored as bcrypt hash

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
```

#### File 2: `src/users/users.service.ts`
```typescript
import { ConflictException, Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity.js';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async findUserByUsername(username: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { username } });
  }

  async findUserByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { email } });
  }

  async findUserById(id: number): Promise<User | null> {
    return this.userRepository.findOne({ where: { id } });
  }

  async createUser(name: string, username: string, email: string, password: string): Promise<User> {
    const existingUsername = await this.findUserByUsername(username);
    if (existingUsername) {
      throw new ConflictException('Username Already Exists');
    }

    const existingEmail = await this.findUserByEmail(email);
    if (existingEmail) {
      throw new ConflictException('Email Already Exists');
    }

    const user = this.userRepository.create({ name, username, email, password });
    return this.userRepository.save(user);
  }
}
```

#### File 3: `src/users/users.module.ts`
```typescript
import { Module } from '@nestjs/common';
import { UsersService } from './users.service.js';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity.js';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  providers: [UsersService],
  exports: [UsersService], // IMPORTANT: AuthModule needs UsersService
})
export class UsersModule {}
```

#### Kyu likha hai:
- **`@InjectRepository(User)`:** TypeORM repository pattern provide karta hai jisse directly database queries (`findOne`, `create`, `save`) perform ho sakein.
- **`exports: [UsersService]`:** Dusre modules (jaise `AuthModule`) ko `UsersService` use karne ke liye export karna zaroori hai.

---

### Step 5: Auth Module, JWT & Middleware (`auth`)

#### File 1: `src/auth/dto/register.dto.ts`
```typescript
import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class RegisterDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  username: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(6, { message: 'Password must be at least 6 characters long' })
  password: string;
}
```

#### File 2: `src/auth/dto/login.dto.ts`
```typescript
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class LoginDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  password: string;
}
```

#### File 3: `src/auth/auth.service.ts`
```typescript
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service.js';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async register(name: string, username: string, email: string, password: string) {
    // 1. Password hashing using bcrypt
    const hashPassword = await bcrypt.hash(password, 10);

    // 2. Save user to database
    const user = await this.userService.createUser(name, username, email, hashPassword);

    // 3. Remove password hash from response for security
    const { password: _, ...savedUser } = user;

    return {
      message: 'Registration Successfully!!!',
      user: savedUser,
    };
  }

  async login(email: string, password: string) {
    // 1. Check if user exists
    const user = await this.userService.findUserByEmail(email);
    if (!user) {
      throw new UnauthorizedException('Invalid Email');
    }

    // 2. Compare incoming password with stored hash
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      throw new UnauthorizedException('Invalid Password');
    }

    // 3. Generate signed JWT token
    const token = await this.jwtService.signAsync({
      userId: user.id,
      name: user.name,
      username: user.username,
      email: user.email,
    });

    return {
      message: 'Login Successfull!!!',
      token,
    };
  }
}
```

#### File 4: `src/auth/auth.middleware.ts` (The Route Protector)
```typescript
import { Injectable, NestMiddleware, UnauthorizedException } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  constructor(private readonly jwtService: JwtService) {}

  async use(req: Request, res: Response, next: NextFunction) {
    // 1. Read Authorization header
    const authHeader = req.headers['authorization'] || req.headers['Authorization'];

    if (!authHeader || typeof authHeader !== 'string') {
      throw new UnauthorizedException('Authorization header is missing');
    }

    // 2. Extract Bearer token
    const [bearer, token] = authHeader.split(' ');

    if (bearer !== 'Bearer' || !token) {
      throw new UnauthorizedException('Invalid authorization format. Expected "Bearer <token>"');
    }

    // 3. Verify JWT token signature and expiration
    try {
      const payload = await this.jwtService.verifyAsync(token);
      (req as any).user = payload; // Attach user payload to request
      next(); // Proceed to controller
    } catch {
      throw new UnauthorizedException('Invalid or expired token');
    }
  }
}
```

#### File 5: `src/auth/auth.controller.ts`
```typescript
import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service.js';
import { RegisterDto } from './dto/register.dto.js';
import { LoginDto } from './dto/login.dto.js';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(
      registerDto.name,
      registerDto.username,
      registerDto.email,
      registerDto.password,
    );
  }

  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto.email, loginDto.password);
  }
}
```

#### File 6: `src/auth/auth.module.ts`
```typescript
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthController } from './auth.controller.js';
import { AuthService } from './auth.service.js';
import { AuthMiddleware } from './auth.middleware.js';
import { UsersModule } from '../users/users.module.js';

@Module({
  imports: [
    UsersModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET') || 'itm',
        signOptions: {
          expiresIn: (configService.get<string>('JWT_EXPIRES_IN') || '1d') as any,
        },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, AuthMiddleware],
  exports: [AuthService, AuthMiddleware, JwtModule],
})
export class AuthModule {}
```

#### Kyu likha hai:
- **`bcrypt.hash` with salt rounds 10:** Passwords ko database me kabhi plain text me store nahi kiya jata.
- **`const { password: _, ...savedUser } = user`:** Response me password hash kabhi client ko wapas return nahi karte.
- **`AuthMiddleware`:** Kisi bhi protected route par request aane par yeh check karta hai ki `Authorization: Bearer <token>` present aur valid hai ya nahi. Agar invalid hai, toh request controller tak pahunchne se pehle hi `401 Unauthorized` return ho jaati hai.

---

### Step 6: Employees Module & CRUD (`employees`)

#### File 1: `src/employees/entities/employee.entity.ts`
```typescript
import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

@Entity('employees')
export class Employee {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column({ unique: true })
  email: string;

  @Column()
  department: string;

  @Column()
  role: string;

  @Column()
  salary: string;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
```

#### File 2: `src/employees/dto/employee-create.dto.ts`
```typescript
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class EmployeeCreateDto {
  @IsNotEmpty()
  @IsString()
  firstName: string;

  @IsNotEmpty()
  @IsString()
  lastName: string;

  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsString()
  department: string;

  @IsNotEmpty()
  @IsString()
  role: string;

  @IsNotEmpty()
  @IsString()
  salary: string;
}
```

#### File 3: `src/employees/dto/employee-update.dto.ts`
```typescript
import { IsBoolean, IsEmail, IsOptional, IsString } from 'class-validator';

export class EmployeeUpdateDto {
  @IsOptional()
  @IsString()
  firstName?: string;

  @IsOptional()
  @IsString()
  lastName?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  department?: string;

  @IsOptional()
  @IsString()
  role?: string;

  @IsOptional()
  @IsString()
  salary?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
```

#### File 4: `src/employees/employees.service.ts`
```typescript
import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Employee } from './entities/employee.entity.js';
import { EmployeeCreateDto } from './dto/employee-create.dto.js';
import { EmployeeUpdateDto } from './dto/employee-update.dto.js';

@Injectable()
export class EmployeesService {
  constructor(
    @InjectRepository(Employee)
    private readonly employeeRepository: Repository<Employee>,
  ) {}

  async create(createEmployeeDto: EmployeeCreateDto) {
    const existing = await this.employeeRepository.findOne({
      where: { email: createEmployeeDto.email },
    });
    if (existing) {
      throw new ConflictException('Employee with this email already exists');
    }

    const employee = this.employeeRepository.create(createEmployeeDto);
    return this.employeeRepository.save(employee);
  }

  async findAll() {
    return this.employeeRepository.find({
      order: { createdAt: 'DESC' },
    });
  }

  async findById(id: number) {
    const employee = await this.employeeRepository.findOne({ where: { id } });
    if (!employee) {
      throw new NotFoundException(`Employee with ID ${id} not found`);
    }
    return employee;
  }

  async findByIdAndUpdate(id: number, updateEmployeeDto: EmployeeUpdateDto) {
    const employee = await this.findById(id);
    Object.assign(employee, updateEmployeeDto);
    return this.employeeRepository.save(employee);
  }

  async findByIdAndDelete(id: number) {
    const employee = await this.findById(id);
    await this.employeeRepository.remove(employee);
    return {
      message: `Employee with ID ${id} deleted successfully`,
    };
  }
}
```

#### File 5: `src/employees/employees.controller.ts`
```typescript
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

  @Get()
  async find() {
    return this.employeeService.findAll();
  }

  @Get(':id')
  async findById(@Param('id', ParseIntPipe) id: number) {
    return this.employeeService.findById(id);
  }

  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateEmployeeDto: EmployeeUpdateDto,
  ) {
    return this.employeeService.findByIdAndUpdate(id, updateEmployeeDto);
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    return this.employeeService.findByIdAndDelete(id);
  }
}
```

#### File 6: `src/employees/employees.module.ts`
```typescript
import { Module } from '@nestjs/common';
import { EmployeesController } from './employees.controller.js';
import { EmployeesService } from './employees.service.js';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Employee } from './entities/employee.entity.js';

@Module({
  imports: [TypeOrmModule.forFeature([Employee])],
  controllers: [EmployeesController],
  providers: [EmployeesService],
})
export class EmployeesModule {}
```

---

### Step 7: Main & Global App Module (`main.ts` & `app.module.ts`)

#### File 1: `src/app.module.ts` (Applying the Middleware)
```typescript
import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { AuthModule } from './auth/auth.module.js';
import { AuthMiddleware } from './auth/auth.middleware.js';
import { UsersModule } from './users/users.module.js';
import { EmployeesModule } from './employees/employees.module.js';
import { EmployeesController } from './employees/employees.controller.js';
import { DatabaseModule } from './database/database.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // Enables process.env everywhere
    }),
    AuthModule,
    UsersModule,
    EmployeesModule,
    DatabaseModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    // Protect ALL routes inside EmployeesController with AuthMiddleware
    consumer
      .apply(AuthMiddleware)
      .forRoutes(EmployeesController);
  }
}
```

#### File 2: `src/main.ts` (Application Entry Point)
```typescript
import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Global DTO Validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Strips away properties not defined in DTO
      transform: true, // Automatically transforms payloads to DTO instances
    }),
  );

  const port = process.env.APP_PORT ?? process.env.PORT ?? 3000;
  await app.listen(port);
  console.log(`Application is running on: http://localhost:${port}`);
}
await bootstrap();
```

---

## 6. Complete API Documentation

### Summary Table

| Method | Endpoint | Protection | Description |
|---|---|---|---|
| `POST` | `/auth/register` | Public | Register new user account |
| `POST` | `/auth/login` | Public | Authenticate user & get JWT token |
| `POST` | `/employees` | **JWT Protected** | Add a new employee |
| `GET` | `/employees` | **JWT Protected** | Get list of all employees |
| `GET` | `/employees/:id` | **JWT Protected** | Get single employee details |
| `PATCH` | `/employees/:id` | **JWT Protected** | Update employee details |
| `DELETE` | `/employees/:id` | **JWT Protected** | Delete employee record |

---

### 1. Register User
- **URL:** `POST /auth/register`
- **Headers:** `Content-Type: application/json`
- **Request Body (Input):**
```json
{
  "name": "Suraj Sahani",
  "username": "suraj123",
  "email": "suraj@gmail.com",
  "password": "Password@123"
}
```
- **Success Response (`201 Created`):**
```json
{
  "message": "Registration Successfully!!!",
  "user": {
    "id": 1,
    "name": "Suraj Sahani",
    "username": "suraj123",
    "email": "suraj@gmail.com",
    "isActive": true,
    "createdAt": "2026-08-28T12:00:00.000Z",
    "updatedAt": "2026-08-28T12:00:00.000Z"
  }
}
```
- **Error Response (`409 Conflict`):**
```json
{
  "message": "Email Already Exists",
  "error": "Conflict",
  "statusCode": 409
}
```
- **cURL Command:**
```bash
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Suraj Sahani","username":"suraj123","email":"suraj@gmail.com","password":"Password@123"}'
```

---

### 2. Login User
- **URL:** `POST /auth/login`
- **Headers:** `Content-Type: application/json`
- **Request Body (Input):**
```json
{
  "email": "suraj@gmail.com",
  "password": "Password@123"
}
```
- **Success Response (`200 OK` or `201 Created`):**
```json
{
  "message": "Login Successfull!!!",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsIm5hbWUiOiJTdXJhaiBTYWhhbmkiLCJ1c2VybmFtZSI6InN1cmFqMTIzIiwiZW1haWwiOiJzdXJhakBnbWFpbC5jb20iLCJpYXQiOjE3NTYzOTIwMDAsImV4cCI6MTc1NjQ3ODQwMH0.signature"
}
```
- **Error Response (`401 Unauthorized`):**
```json
{
  "message": "Invalid Password",
  "error": "Unauthorized",
  "statusCode": 401
}
```
- **cURL Command:**
```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"suraj@gmail.com","password":"Password@123"}'
```

---

### 3. Create Employee
- **URL:** `POST /employees`
- **Headers:**
  - `Authorization: Bearer <your_jwt_token>`
  - `Content-Type: application/json`
- **Request Body (Input):**
```json
{
  "firstName": "Rahul",
  "lastName": "Gupta",
  "email": "rahul@gmail.com",
  "department": "Development",
  "role": "Full Stack Developer",
  "salary": "8.5 LPA"
}
```
- **Success Response (`201 Created`):**
```json
{
  "id": 1,
  "firstName": "Rahul",
  "lastName": "Gupta",
  "email": "rahul@gmail.com",
  "department": "Development",
  "role": "Full Stack Developer",
  "salary": "8.5 LPA",
  "isActive": true,
  "createdAt": "2026-08-28T12:05:00.000Z",
  "updatedAt": "2026-08-28T12:05:00.000Z"
}
```
- **Error Response (`401 Unauthorized` when token is missing):**
```json
{
  "message": "Authorization header is missing",
  "error": "Unauthorized",
  "statusCode": 401
}
```
- **cURL Command:**
```bash
curl -X POST http://localhost:3000/employees \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"firstName":"Rahul","lastName":"Gupta","email":"rahul@gmail.com","department":"Development","role":"Full Stack Developer","salary":"8.5 LPA"}'
```

---

### 4. Get All Employees
- **URL:** `GET /employees`
- **Headers:** `Authorization: Bearer <your_jwt_token>`
- **Success Response (`200 OK`):**
```json
[
  {
    "id": 1,
    "firstName": "Rahul",
    "lastName": "Gupta",
    "email": "rahul@gmail.com",
    "department": "Development",
    "role": "Full Stack Developer",
    "salary": "8.5 LPA",
    "isActive": true,
    "createdAt": "2026-08-28T12:05:00.000Z",
    "updatedAt": "2026-08-28T12:05:00.000Z"
  }
]
```
- **cURL Command:**
```bash
curl -X GET http://localhost:3000/employees \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

### 5. Get Employee By ID
- **URL:** `GET /employees/:id` (e.g. `/employees/1`)
- **Headers:** `Authorization: Bearer <your_jwt_token>`
- **Success Response (`200 OK`):**
```json
{
  "id": 1,
  "firstName": "Rahul",
  "lastName": "Gupta",
  "email": "rahul@gmail.com",
  "department": "Development",
  "role": "Full Stack Developer",
  "salary": "8.5 LPA",
  "isActive": true,
  "createdAt": "2026-08-28T12:05:00.000Z",
  "updatedAt": "2026-08-28T12:05:00.000Z"
}
```
- **Error Response (`404 Not Found`):**
```json
{
  "message": "Employee with ID 999 not found",
  "error": "Not Found",
  "statusCode": 404
}
```
- **cURL Command:**
```bash
curl -X GET http://localhost:3000/employees/1 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

### 6. Update Employee
- **URL:** `PATCH /employees/:id` (e.g. `/employees/1`)
- **Headers:**
  - `Authorization: Bearer <your_jwt_token>`
  - `Content-Type: application/json`
- **Request Body (Partial Update):**
```json
{
  "salary": "12 LPA",
  "role": "Tech Lead"
}
```
- **Success Response (`200 OK`):**
```json
{
  "id": 1,
  "firstName": "Rahul",
  "lastName": "Gupta",
  "email": "rahul@gmail.com",
  "department": "Development",
  "role": "Tech Lead",
  "salary": "12 LPA",
  "isActive": true,
  "createdAt": "2026-08-28T12:05:00.000Z",
  "updatedAt": "2026-08-28T12:10:00.000Z"
}
```
- **cURL Command:**
```bash
curl -X PATCH http://localhost:3000/employees/1 \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"salary":"12 LPA","role":"Tech Lead"}'
```

---

### 7. Delete Employee
- **URL:** `DELETE /employees/:id` (e.g. `/employees/1`)
- **Headers:** `Authorization: Bearer <your_jwt_token>`
- **Success Response (`200 OK`):**
```json
{
  "message": "Employee with ID 1 deleted successfully"
}
```
- **cURL Command:**
```bash
curl -X DELETE http://localhost:3000/employees/1 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## 7. Postman Testing Workflow

1. **Step 1:** Open Postman and send `POST http://localhost:3000/auth/register` with name, username, email, password.
2. **Step 2:** Send `POST http://localhost:3000/auth/login` with email and password. Copy the `token` from the response.
3. **Step 3:** Try sending `GET http://localhost:3000/employees` without any headers. You will receive:
   ```json
   {
     "statusCode": 401,
     "message": "Authorization header is missing",
     "error": "Unauthorized"
   }
   ```
4. **Step 4:** In Postman, switch to the **Authorization** tab, choose type **Bearer Token**, and paste your token.
5. **Step 5:** Resend `GET http://localhost:3000/employees` — you will receive `200 OK` with the employee list!

---

## 8. Common Errors & Troubleshooting

### 1. `UnknownDependenciesException: Nest can't resolve dependencies of the AuthService (?, JwtService)`
- **Reason:** `AuthService` relies on `UsersService`, but `UsersModule` wasn't imported into `AuthModule`.
- **Solution:** Add `imports: [UsersModule]` in `src/auth/auth.module.ts` and ensure `UsersModule` has `exports: [UsersService]`.

### 2. `listen EADDRINUSE: address already in use :::3000`
- **Reason:** A previous Node.js process is already running on port 3000.
- **Solution:**
  ```powershell
  # Find PID on port 3000
  netstat -ano | findstr :3000
  # Kill process by PID (e.g., PID 1234)
  taskkill /F /PID 1234
  ```

### 3. Database connection refused (`ECONNREFUSED 127.0.0.1:5435`)
- **Reason:** Docker container is not running.
- **Solution:** Run `docker compose up -d` and check with `docker ps`. Verify `DB_PORT=5435` in `.env` matches `5435:5432` in `docker-compose.yml`.

### 4. `Error: "secretOrPrivateKey" must have a value`
- **Reason:** `JwtService` was used without configuring a secret key.
- **Solution:** Register `JwtModule.registerAsync` in `AuthModule` reading `JWT_SECRET` from `ConfigService`.

---

## License
MIT
