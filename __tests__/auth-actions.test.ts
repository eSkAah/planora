import {
  afterAll,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  jest,
} from '@jest/globals';

type PrismaMock = ReturnType<typeof createPrismaMock>;

type SupabaseAdminMock = ReturnType<
  typeof createSupabaseAdminScaffold
>['client'];

type SupabaseAdminScaffold = ReturnType<typeof createSupabaseAdminScaffold>;

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

const createSupabaseAdminScaffold = () => {
  const createUser = jest.fn();
  const deleteUser = jest.fn();
  const from = jest.fn();

  return {
    client: {
      auth: {
        admin: {
          createUser,
          deleteUser,
        },
      },
      from,
    },
    handlers: {
      createUser,
      deleteUser,
      from,
    },
  };
};

let prismaMock: PrismaMock = createPrismaMock();
let supabaseAdminScaffold: SupabaseAdminScaffold =
  createSupabaseAdminScaffold();
let currentSupabaseAdminMock: SupabaseAdminMock = supabaseAdminScaffold.client;
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
let signOutAction: typeof import('@/lib/auth/actions').signOutAction;
let databaseClientModule: typeof import('@/lib/database/client');
let supabaseServerModule: typeof import('@/lib/supabase/server');
let redirectMock: jest.Mock;
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
    get: () => currentSupabaseAdminMock,
    set: value => {
      currentSupabaseAdminMock = value as SupabaseAdminMock;
    },
  });

  jest
    .spyOn(supabaseServerModule, 'createServerSupabaseClient')
    .mockImplementation(
      createServerSupabaseClientMock as unknown as typeof supabaseServerModule.createServerSupabaseClient
    );

  const navigationModule = await import('next/navigation');
  redirectMock = navigationModule.redirect as jest.Mock;

  const actionsModule = await import('@/lib/auth/actions');
  createAccount = actionsModule.createAccount;
  signIn = actionsModule.signIn;
  signOutAction = actionsModule.signOutAction;
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

    supabaseAdminScaffold = createSupabaseAdminScaffold();
    currentSupabaseAdminMock = supabaseAdminScaffold.client;

    createServerSupabaseClientMock.mockReset();
    redirectMock.mockReset();
    jest
      .spyOn(databaseClientModule, 'isDatabaseConfigured')
      .mockReturnValue(true);
  });

  it('fails validation with detailed errors when form data is incomplete', async () => {
    const formData = new FormData();
    formData.set('company.name', '');

    const result = await createAccount(formData);

    expect(result.success).toBe(false);
    expect(result.fieldErrors).toBeDefined();
    expect(createServerSupabaseClientMock).not.toHaveBeenCalled();
  });

  it('cleans up company when user creation fails', async () => {
    jest
      .spyOn(databaseClientModule, 'isDatabaseConfigured')
      .mockReturnValue(false);
    (databaseClientModule.getPrismaClient as jest.Mock).mockReturnValue(null);

    const companiesSelectMaybeSingle = jest
      .fn()
      .mockResolvedValue({ data: null, error: null });
    const companiesSelect = jest.fn(() => ({
      eq: jest.fn(() => ({ maybeSingle: companiesSelectMaybeSingle })),
    }));
    const companiesInsertSingle = jest
      .fn()
      .mockResolvedValue({ data: { id: 'company-id' }, error: null });
    const companiesInsert = jest.fn(() => ({
      select: jest.fn(() => ({ single: companiesInsertSingle })),
    }));
    const companiesDelete = jest.fn(() => ({
      eq: jest.fn(async () => ({ error: null })),
    }));

    currentSupabaseAdminMock = {
      auth: {
        admin: {
          createUser: jest.fn(async () => ({
            data: null,
            error: { message: 'User creation failed' },
          })),
          deleteUser: jest.fn(),
        },
      },
      from: jest.fn((table: string) => {
        if (table === 'companies') {
          return {
            select: companiesSelect,
            insert: companiesInsert,
            delete: companiesDelete,
          } as unknown;
        }
        return {} as unknown;
      }),
    };

    const result = await createAccount(buildValidFormData());

    expect(result.success).toBe(false);
    expect(result.error).toBe('User creation failed');
    expect(companiesDelete).toHaveBeenCalled();
  });

  it('creates tenant using Supabase admin when Prisma is unavailable', async () => {
    jest
      .spyOn(databaseClientModule, 'isDatabaseConfigured')
      .mockReturnValue(false);
    (databaseClientModule.getPrismaClient as jest.Mock).mockReturnValue(null);

    const companiesSelectMaybeSingle = jest
      .fn()
      .mockResolvedValue({ data: null, error: null });
    const companiesSelect = jest.fn(() => ({
      eq: jest.fn(() => ({ maybeSingle: companiesSelectMaybeSingle })),
    }));
    const companiesInsertSingle = jest
      .fn()
      .mockResolvedValue({ data: { id: 'company-id' }, error: null });
    const companiesInsert = jest.fn(() => ({
      select: jest.fn(() => ({ single: companiesInsertSingle })),
    }));
    const companiesDelete = jest.fn(() => ({
      eq: jest.fn(async () => ({ error: null })),
    }));
    const usersInsert = jest.fn(async () => ({ error: null }));

    currentSupabaseAdminMock = {
      auth: {
        admin: {
          createUser: jest.fn(async () => ({
            data: {
              user: { id: 'user-id', email: 'marie.manager@aurora.dev' },
            },
            error: null,
          })),
          deleteUser: jest.fn(),
        },
      },
      from: jest.fn((table: string) => {
        if (table === 'companies') {
          return {
            select: companiesSelect,
            insert: companiesInsert,
            delete: companiesDelete,
          } as unknown;
        }
        if (table === 'users') {
          return {
            insert: usersInsert,
          } as unknown;
        }
        return {} as unknown;
      }),
    };

    const result = await createAccount(buildValidFormData());

    expect(result.success).toBe(true);
    expect(companiesSelect).toHaveBeenCalledWith('id');
    expect(companiesInsert).toHaveBeenCalledWith({
      name: 'Aurora Retail',
      country: 'France',
      sector: 'Retail',
    });
    expect(usersInsert).toHaveBeenCalledWith({
      id: 'user-id',
      email: 'marie.manager@aurora.dev',
      first_name: 'Marie',
      last_name: 'Dupont',
      role: 'admin',
      company_id: 'company-id',
      is_active: true,
    });
  });

  it('returns explicit error when Supabase admin client is missing', async () => {
    jest
      .spyOn(databaseClientModule, 'isDatabaseConfigured')
      .mockReturnValue(false);
    (databaseClientModule.getPrismaClient as jest.Mock).mockReturnValue(null);
    currentSupabaseAdminMock = null as unknown as SupabaseAdminMock;

    const result = await createAccount(buildValidFormData());

    expect(result.success).toBe(false);
    expect(result.error).toMatch(/Supabase admin client is not configured/i);
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

    (createServerSupabaseClientMock as jest.Mock).mockResolvedValue({
      auth: {
        signInWithPassword: signInMock,
      },
    } as unknown);

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

  it('signs out through Supabase and redirects home', async () => {
    const signOutMock = jest.fn().mockResolvedValue({ error: null });
    (createServerSupabaseClientMock as jest.Mock).mockResolvedValue({
      auth: {
        signOut: signOutMock,
      },
    } as unknown);

    await signOutAction();

    expect(signOutMock).toHaveBeenCalled();
    expect(redirectMock).toHaveBeenCalledWith('/');
  });
});
