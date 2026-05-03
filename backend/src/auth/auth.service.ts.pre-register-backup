import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../common/prisma.service';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async validateUser(email: string, password: string) {
    const user = await this.prisma.user.findUnique({
      where: { email },
      include: { company: true },
    });

    if (user && await bcrypt.compare(password, user.password)) {
      if ((user.status || 'ACTIVE') === 'DISMISSED') {
        throw new UnauthorizedException('Учетная запись сотрудника отключена');
      }

      if (user.company && (user.company.status || 'ACTIVE') === 'TERMINATED') {
        throw new UnauthorizedException('Доступ в кабинет компании закрыт');
      }

      const { password, ...result } = user;
      return result;
    }

    return null;
  }

  async login(user: any) {
    const payload = { email: user.email, sub: user.id, role: user.role };
    return {
      access_token: this.jwtService.sign(payload),
      user,
    };
  }
}
