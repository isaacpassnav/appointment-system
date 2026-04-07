import bcrypt from 'bcrypt';
import { TenantRole, UserRole } from '@prisma/client';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { NotificationsService } from '../notifications/notifications.service';

describe('AuthService', () => {
  const configValues = {
    JWT_ACCESS_SECRET: 'access-secret',
    JWT_REFRESH_SECRET: 'refresh-secret',
    JWT_ACCESS_EXPIRES_IN: '15m',
    JWT_REFRESH_EXPIRES_IN: '7d',
  } as const;

  const configService = {
    get: jest.fn((key: keyof typeof configValues) => configValues[key]),
  };

  const jwtService = {
    signAsync: jest.fn((_payload: unknown, options: { secret?: string }) =>
      Promise.resolve(
        options.secret === configValues.JWT_ACCESS_SECRET
          ? 'access-token'
          : 'refresh-token',
      ),
    ),
  };

  const notificationsService = {} as NotificationsService;

  const createUsersServiceMock = () =>
    ({
      findByEmail: jest.fn(),
      listTenantMemberships: jest.fn(),
      findTenantMembership: jest.fn(),
      findTenantById: jest.fn(),
      setRefreshTokenHash: jest.fn(),
      findOne: jest.fn(),
    }) as unknown as UsersService;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('signs in without tenantId by defaulting to the matching client membership', async () => {
    const passwordHash = await bcrypt.hash('DemoPass123!', 4);
    const usersService = createUsersServiceMock();
    const findTenantMembershipMock = jest.spyOn(
      usersService,
      'findTenantMembership',
    );

    jest.spyOn(usersService, 'findByEmail').mockResolvedValue({
      id: 'user-client',
      email: 'demo.client@appointment.local',
      fullName: 'Carlos Client',
      role: UserRole.CLIENT,
      emailVerified: true,
      passwordHash,
    } as Awaited<ReturnType<UsersService['findByEmail']>>);
    jest.spyOn(usersService, 'listTenantMemberships').mockResolvedValue([
      {
        role: TenantRole.BUSINESS_ADMIN,
        tenant: {
          id: 'tenant-legacy',
          name: 'Default Tenant',
          slug: 'default-tenant',
          status: 'ACTIVE',
          resellerId: null,
        },
      },
      {
        role: TenantRole.CLIENT,
        tenant: {
          id: 'tenant-clinic',
          name: 'Clinica Dental Sonrisa',
          slug: 'clinica-dental-sonrisa',
          status: 'ACTIVE',
          resellerId: null,
        },
      },
    ]);
    jest
      .spyOn(usersService, 'setRefreshTokenHash')
      .mockResolvedValue(undefined);
    const createdAt = new Date();
    const updatedAt = new Date();
    jest.spyOn(usersService, 'findOne').mockResolvedValue({
      id: 'user-client',
      email: 'demo.client@appointment.local',
      fullName: 'Carlos Client',
      phone: null,
      timezone: 'America/Lima',
      role: UserRole.CLIENT,
      emailVerified: true,
      createdAt,
      updatedAt,
    } as Awaited<ReturnType<UsersService['findOne']>>);

    const authService = new AuthService(
      usersService,
      jwtService as never,
      configService as never,
      notificationsService,
    );

    const result = await authService.signIn({
      email: 'demo.client@appointment.local',
      password: 'DemoPass123!',
    });

    expect(result.accessToken).toBe('access-token');
    expect(result.refreshToken).toBe('refresh-token');
    expect(result.user.tenantId).toBe('tenant-clinic');
    expect(result.user.tenantRole).toBe(TenantRole.CLIENT);
    expect(result.user.activeTenant).toMatchObject({
      id: 'tenant-clinic',
      name: 'Clinica Dental Sonrisa',
      role: TenantRole.CLIENT,
    });
    expect(findTenantMembershipMock).not.toHaveBeenCalled();
  });

  it('prefers business admin membership for business users without tenantId', async () => {
    const passwordHash = await bcrypt.hash('DemoPass123!', 4);
    const usersService = createUsersServiceMock();

    jest.spyOn(usersService, 'findByEmail').mockResolvedValue({
      id: 'user-admin',
      email: 'demo.admin@appointment.local',
      fullName: 'Diego Business Admin',
      role: UserRole.ADMIN,
      emailVerified: true,
      passwordHash,
    } as Awaited<ReturnType<UsersService['findByEmail']>>);
    jest.spyOn(usersService, 'listTenantMemberships').mockResolvedValue([
      {
        role: TenantRole.CLIENT,
        tenant: {
          id: 'tenant-client-view',
          name: 'Client View',
          slug: 'client-view',
          status: 'ACTIVE',
          resellerId: null,
        },
      },
      {
        role: TenantRole.BUSINESS_ADMIN,
        tenant: {
          id: 'tenant-admin',
          name: 'Clinica Dental Sonrisa',
          slug: 'clinica-dental-sonrisa',
          status: 'ACTIVE',
          resellerId: null,
        },
      },
    ]);
    jest
      .spyOn(usersService, 'setRefreshTokenHash')
      .mockResolvedValue(undefined);
    const createdAt = new Date();
    const updatedAt = new Date();
    jest.spyOn(usersService, 'findOne').mockResolvedValue({
      id: 'user-admin',
      email: 'demo.admin@appointment.local',
      fullName: 'Diego Business Admin',
      phone: null,
      timezone: 'America/Lima',
      role: UserRole.ADMIN,
      emailVerified: true,
      createdAt,
      updatedAt,
    } as Awaited<ReturnType<UsersService['findOne']>>);

    const authService = new AuthService(
      usersService,
      jwtService as never,
      configService as never,
      notificationsService,
    );

    const result = await authService.signIn({
      email: 'demo.admin@appointment.local',
      password: 'DemoPass123!',
    });

    expect(result.user.tenantId).toBe('tenant-admin');
    expect(result.user.tenantRole).toBe(TenantRole.BUSINESS_ADMIN);
    expect(result.user.activeTenant).toMatchObject({
      id: 'tenant-admin',
      role: TenantRole.BUSINESS_ADMIN,
    });
  });
});
