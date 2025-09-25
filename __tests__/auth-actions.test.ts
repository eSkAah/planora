import {
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  jest,
  afterAll,
} from '@jest/globals';

type PrismaMock = ReturnType<typeof createPrismaMock>;

const createPrismaMock = () => ({
  company: {
    findUnique: jest.fn(),
    create: jest.fn(),
    delete: jest.fn(),
  },
  user: {
    create: jest.fn(),
  },
});

let prismaMock: PrismaMock = createPrismaMock();

const supabaseAdminMock = {
  auth: {
    admin: {
      deleteUser: jest.fn(),
    },
  },
};

const createServerSupabaseClientMock = jest.fn();

jest.unstable_mockModule('@/generated/prisma', () => ({
  __esModule: true,
  PrismaClient: jest.fn().mockImplementation(() => prismaMock),
}));

jest.unstable_mockModule('server-only', () => ({}), { virtual: true });
jest.unstable_mockModule(
  'next/navigation',
  () => ({
    __esModule: true,
    redirect: jest.fn(),
  }),
  { virtual: true }
);

let createAccount: typeof import('@/lib/auth/actions').createAccount;
let signIn: typeof import('@/lib/auth/actions').signIn;
let databaseClientModule: typeof import('@/lib/database/client');
let supabaseServerModule: typeof import('@/lib/supabase/server');
let originalEnv: NodeJS.ProcessEnv;

beforeAll(async () => {
  originalEnv = process.env;
  process.env = {
    ...originalEnv,
    NEXT_PUBLIC_APP_URL: 'http://localhost:3000',
    NEXT_PUBLIC_SUPABASE_URL: 'http://localhost:54321',
    NEXT_PUBLIC_SUPABASE_ANON_KEY: 'anon-anon-anon',
    SUPABASE_SERVICE_ROLE_KEY: '',
    DATABASE_URL: 'postgres://localhost/testdb',
  } as NodeJS.ProcessEnv;

  databaseClientModule = await import('@/lib/database/client');
  supabaseServerModule = await import('@/lib/supabase/server');

  jest
    .spyOn(databaseClientModule, 'getPrismaClient')
    .mockImplementation(
      () =>
        prismaMock as unknown as ReturnType<
          typeof databaseClientModule.getPrismaClient
        >
    );

  jest
    .spyOn(databaseClientModule, 'isDatabaseConfigured')
    .mockImplementation(() => true);

  Object.defineProperty(databaseClientModule, 'supabaseAdmin', {
    configurable: true,
    get: () => supabaseAdminMock,
  });

  jest
    .spyOn(supabaseServerModule, 'createServerSupabaseClient')
    .mockImplementation(
      createServerSupabaseClientMock as unknown as typeof supabaseServerModule.createServerSupabaseClient
    );

  const actionsModule = await import('@/lib/auth/actions');
  createAccount = actionsModule.createAccount;
  signIn = actionsModule.signIn;
});

afterAll(() => {
  process.env = originalEnv;
});

describe('auth server actions', () => {
  const buildValidFormData = () => {
    const formData = new FormData();
    formData.set('company.name', 'Aurora Retail');
    formData.set('company.country', 'France');
    formData.set('company.sector', 'Retail');
    formData.set('user.email', 'marie.manager@aurora.dev');
    formData.set('user.password', 'Password123');
    formData.set('user.confirmPassword', 'Password123');
    formData.set('user.firstName', 'Marie');
    formData.set('user.lastName', 'Dupont');
    formData.set('user.role', 'ADMIN');
    return formData;
  };

  beforeEach(() => {
    prismaMock = createPrismaMock();
    (
      databaseClientModule.getPrismaClient as unknown as jest.Mock
    ).mockReturnValue(prismaMock);
    supabaseAdminMock.auth.admin.deleteUser.mockReset();
    createServerSupabaseClientMock.mockClear();
  });

  it('fails validation with detailed errors when form data is incomplete', async () => {
    const formData = new FormData();
    formData.set('company.name', '');

    const result = await createAccount(formData);

    expect(result.success).toBe(false);
    expect(result.fieldErrors).toBeDefined();
    expect(createServerSupabaseClientMock).not.toHaveBeenCalled();
  });

  it('cleans up company when Supabase signUp fails', async () => {
    (prismaMock.company.findUnique as jest.Mock).mockResolvedValue(null);
    (prismaMock.company.create as jest.Mock).mockResolvedValue({
      id: 'company-id',
    });

    (createServerSupabaseClientMock as jest.Mock).mockResolvedValue({
      auth: {
        signUp: jest.fn().mockResolvedValue({
          data: { user: null, session: null },
          error: { message: 'signup failed' },
        }),
      },
    } as unknown);

    const result = await createAccount(buildValidFormData());

    expect(result.success).toBe(false);
    expect(result.error).toBe('signup failed');
    expect(prismaMock.company.delete as jest.Mock).toHaveBeenCalledWith({
      where: { id: 'company-id' },
    });
  });

  it('creates company and user profile on success', async () => {
    (prismaMock.company.findUnique as jest.Mock).mockResolvedValue(null);
    (prismaMock.company.create as jest.Mock).mockResolvedValue({
      id: 'company-id',
    });

    const signUpMock = jest.fn().mockResolvedValue({
      data: {
        user: { id: 'user-id', email: 'marie.manager@aurora.dev' },
        session: { id: 'session-id' },
      },
      error: null,
    });

    (createServerSupabaseClientMock as jest.Mock).mockResolvedValue({
      auth: {
        signUp: signUpMock,
      },
    } as unknown);

    const result = await createAccount(buildValidFormData());

    expect(result.success).toBe(true);
    expect(prismaMock.company.create as jest.Mock).toHaveBeenCalled();
    expect(prismaMock.user.create as jest.Mock).toHaveBeenCalledWith({
      data: {
        id: 'user-id',
        email: 'marie.manager@aurora.dev',
        firstName: 'Marie',
        lastName: 'Dupont',
        role: 'ADMIN',
        companyId: 'company-id',
      },
    });
  });

  it('returns error when sign in validation fails', async () => {
    const formData = new FormData();
    formData.set('email', 'not-an-email');
    formData.set('password', '');

    const result = await signIn(formData);

    expect(result.success).toBe(false);
    expect(result.error).toMatch(/invalid email/i);
    expect(createServerSupabaseClientMock).not.toHaveBeenCalled();
  });

  it('signs in a user with Supabase credentials', async () => {
    const signInMock = jest.fn().mockResolvedValue({
      data: {
        user: { id: 'user-id', email: 'marie.manager@aurora.dev' },
        session: { id: 'session-id' },
      },
      error: null,
    });

    (createServerSupabaseClientMock as jest.Mock).mockImplementation(
      async () =>
        ({
          auth: {
            signInWithPassword: signInMock,
          },
        }) as unknown
    );

    const formData = new FormData();
    formData.set('email', 'marie.manager@aurora.dev');
    formData.set('password', 'Password123');

    const result = await signIn(formData);

    expect(signInMock).toHaveBeenCalledWith({
      email: 'marie.manager@aurora.dev',
      password: 'Password123',
    });
    expect(result.success).toBe(true);
    expect((result.data as { session?: unknown })?.session).toBeDefined();
  });
});
