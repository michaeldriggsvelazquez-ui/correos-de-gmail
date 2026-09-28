const SESSION_DURATION = 7 * 24 * 60 * 60 * 1000;

let schemaReady = false;
let schemaPromise = null;

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    try {
      await ensureSchema(env);

      /*
       * =====================================================
       * HEALTH
       * =====================================================
       */

      if (
        url.pathname === "/api/health" &&
        request.method === "GET"
      ) {
        return handleHealth(env);
      }

      /*
       * =====================================================
       * AUTH
       * =====================================================
       */

      if (
        url.pathname === "/api/auth/register" &&
        request.method === "POST"
      ) {
        return handleRegister(request, env);
      }

      if (
        url.pathname === "/api/auth/login" &&
        request.method === "POST"
      ) {
        return handleLogin(request, env);
      }

      if (
        url.pathname === "/api/auth/logout" &&
        request.method === "POST"
      ) {
        return handleLogout(request, env);
      }

      if (
        url.pathname === "/api/auth/me" &&
        request.method === "GET"
      ) {
        return handleMe(request, env);
      }

      /*
       * =====================================================
       * USER
       * =====================================================
       */

      if (
        url.pathname === "/api/requests" &&
        request.method === "POST"
      ) {
        return handleCreateRequest(request, env);
      }

      if (
        url.pathname === "/api/requests" &&
        request.method === "GET"
      ) {
        return handleUserRequests(request, env);
      }

      if (
        url.pathname === "/api/notifications" &&
        request.method === "GET"
      ) {
        return handleUserNotifications(request, env);
      }

      if (
        url.pathname === "/api/notifications/read" &&
        request.method === "POST"
      ) {
        return handleMarkNotificationsRead(request, env);
      }

      if (
        url.pathname === "/api/transactions" &&
        request.method === "GET"
      ) {
        return handleUserTransactions(request, env);
      }

      /*
       * =====================================================
       * WITHDRAWALS
       * =====================================================
       */

      if (
        url.pathname === "/api/withdrawals" &&
        request.method === "POST"
      ) {
        return handleCreateWithdrawal(request, env);
      }

      if (
        url.pathname === "/api/withdrawals" &&
        request.method === "GET"
      ) {
        return handleUserWithdrawals(request, env);
      }

      /*
       * =====================================================
       * ADMIN
       * =====================================================
       */

      if (
        url.pathname === "/api/admin/dashboard" &&
        request.method === "GET"
      ) {
        return handleAdminDashboard(request, env);
      }

      if (
        url.pathname === "/api/admin/users" &&
        request.method === "GET"
      ) {
        return handleAdminUsers(request, env);
      }

      if (
        url.pathname === "/api/admin/users/status" &&
        request.method === "POST"
      ) {
        return handleAdminUserStatus(request, env);
      }

      if (
        url.pathname === "/api/admin/requests" &&
        request.method === "GET"
      ) {
        return handleAdminRequests(request, env);
      }

      if (
        url.pathname === "/api/admin/requests/action" &&
        request.method === "POST"
      ) {
        return handleAdminRequestAction(request, env);
      }

      if (
        url.pathname === "/api/admin/requests/pending-count" &&
        request.method === "GET"
      ) {
        return handleAdminPendingRequestCount(request, env);
      }

      if (
        url.pathname === "/api/admin/balances" &&
        request.method === "GET"
      ) {
        return handleAdminBalances(request, env);
      }

      if (
        url.pathname === "/api/admin/transactions" &&
        request.method === "GET"
      ) {
        return handleAdminTransactions(request, env);
      }

      if (
        url.pathname === "/api/admin/notifications" &&
        request.method === "GET"
      ) {
        return handleAdminNotifications(request, env);
      }

      if (
        url.pathname === "/api/admin/admins" &&
        request.method === "GET"
      ) {
        return handleAdminListAdmins(request, env);
      }

      if (
        url.pathname === "/api/admin/admins" &&
        request.method === "POST"
      ) {
        return handleAdminCreateAdmin(request, env);
      }

      if (
        url.pathname === "/api/admin/admins/status" &&
        request.method === "POST"
      ) {
        return handleAdminAdminStatus(request, env);
      }

      if (
        url.pathname === "/api/admin/stats" &&
        request.method === "GET"
      ) {
        return handleAdminStats(request, env);
      }

      if (
        url.pathname === "/api/admin/config" &&
        request.method === "GET"
      ) {
        return handleAdminGetConfig(request, env);
      }

      if (
        url.pathname === "/api/admin/config" &&
        request.method === "POST"
      ) {
        return handleAdminSetConfig(request, env);
      }

      if (
        url.pathname === "/api/admin/withdrawals" &&
        request.method === "GET"
      ) {
        return handleAdminWithdrawals(request, env);
      }

      if (
        url.pathname === "/api/admin/withdrawals/action" &&
        request.method === "POST"
      ) {
        return handleAdminWithdrawalAction(request, env);
      }

      /*
       * =====================================================
       * UNKNOWN API
       * =====================================================
       */

      if (url.pathname.startsWith("/api/")) {
        return json(
          {
            success: false,
            error: "Ruta API no disponible."
          },
          404
        );
      }

      /*
       * =====================================================
       * PUBLIC ASSETS
       * =====================================================
       */

      return env.ASSETS.fetch(request);

    } catch (error) {
      console.error("API error:", error);

      return json(
        {
          success: false,
          error: "Error interno del servidor."
        },
        500
      );
    }
  }
};


/*
 * =========================================================
 * DATABASE
 * =========================================================
 */

async function ensureSchema(env) {
  if (schemaReady) {
    return;
  }

  if (schemaPromise) {
    return schemaPromise;
  }

  schemaPromise = (async () => {

    await env.DB1.batch([

      env.DB1.prepare(`
        CREATE TABLE IF NOT EXISTS users (
          id TEXT PRIMARY KEY,
          email TEXT NOT NULL UNIQUE,
          username TEXT NOT NULL,
          password_hash TEXT NOT NULL,
          role TEXT NOT NULL DEFAULT 'user',
          balance REAL NOT NULL DEFAULT 0,
          referral_code TEXT,
          referred_by TEXT,
          user_status INTEGER NOT NULL DEFAULT 1,
          created_at INTEGER NOT NULL,
          updated_at INTEGER NOT NULL
        )
      `),

      env.DB1.prepare(`
        CREATE TABLE IF NOT EXISTS sessions (
          id TEXT PRIMARY KEY,
          user_id TEXT NOT NULL,
          token_hash TEXT NOT NULL UNIQUE,
          expires_at INTEGER NOT NULL,
          created_at INTEGER NOT NULL
        )
      `),

      env.DB1.prepare(`
        CREATE TABLE IF NOT EXISTS requests (
          id TEXT PRIMARY KEY,
          user_id TEXT NOT NULL,
          demo_email TEXT,
          status TEXT NOT NULL DEFAULT 'pending',
          reward REAL NOT NULL DEFAULT 0.20,
          admin_id TEXT,
          admin_note TEXT,
          created_at INTEGER NOT NULL,
          reviewed_at INTEGER
        )
      `),

      env.DB1.prepare(`
        CREATE TABLE IF NOT EXISTS transactions (
          id TEXT PRIMARY KEY,
          user_id TEXT NOT NULL,
          type TEXT NOT NULL,
          amount REAL NOT NULL,
          balance_before REAL NOT NULL,
          balance_after REAL NOT NULL,
          reference_id TEXT,
          description TEXT,
          created_at INTEGER NOT NULL
        )
      `),

      env.DB1.prepare(`
        CREATE TABLE IF NOT EXISTS notifications (
          id TEXT PRIMARY KEY,
          user_id TEXT NOT NULL,
          type TEXT NOT NULL DEFAULT 'system',
          title TEXT NOT NULL,
          message TEXT NOT NULL,
          read INTEGER NOT NULL DEFAULT 0,
          created_at INTEGER NOT NULL
        )
      `),

      env.DB1.prepare(`
        CREATE TABLE IF NOT EXISTS admin_accounts (
          id TEXT PRIMARY KEY,
          user_id TEXT NOT NULL,
          password_hash TEXT NOT NULL,
          active INTEGER NOT NULL DEFAULT 1,
          is_primary INTEGER NOT NULL DEFAULT 0,
          created_at INTEGER NOT NULL,
          updated_at INTEGER NOT NULL
        )
      `),

      env.DB1.prepare(`
        CREATE TABLE IF NOT EXISTS app_config (
          key TEXT PRIMARY KEY,
          value TEXT NOT NULL,
          updated_at INTEGER NOT NULL
        )
      `),

      env.DB1.prepare(`
        CREATE TABLE IF NOT EXISTS withdrawals (
          id TEXT PRIMARY KEY,
          user_id TEXT NOT NULL,
          amount REAL NOT NULL,
          address TEXT,
          status TEXT NOT NULL DEFAULT 'pending',
          admin_id TEXT,
          admin_note TEXT,
          created_at INTEGER NOT NULL,
          reviewed_at INTEGER
        )
      `)
    ]);

    await ensureUserStatusColumn(env);
    await ensureRequestSchema(env);

    await ensureConfig(
      env,
      "default_reward",
      "0.20"
    );

    await ensureConfig(
      env,
      "minimum_withdrawal",
      "10"
    );

    /*
     * =====================================================
     * ADMIN AUTOMÁTICO
     *
     * El administrador principal se obtiene desde:
     *
     * ADMIN_EMAIL
     * ADMIN_PASSWORD
     *
     * definidos como variables/secretos del Worker.
     * =====================================================
     */

    await ensurePrimaryAdmin(env);

    schemaReady = true;

  })();

  try {
    await schemaPromise;
  } catch (error) {
    schemaPromise = null;
    throw error;
  }
}


/*
 * =========================================================
 * MIGRATIONS
 * =========================================================
 */

async function ensureUserStatusColumn(env) {
  try {
    await env.DB1
      .prepare(`
        ALTER TABLE users
        ADD COLUMN user_status INTEGER NOT NULL DEFAULT 1
      `)
      .run();
  } catch {}
}


async function ensureRequestSchema(env) {
  try {

    const result = await env.DB1
      .prepare(`
        PRAGMA table_info(requests)
      `)
      .all();

    const names = new Set(
      (result.results || []).map(
        column => column.name
      )
    );

    const migrations = [];

    if (!names.has("demo_email")) {
      migrations.push(
        env.DB1.prepare(`
          ALTER TABLE requests
          ADD COLUMN demo_email TEXT
        `)
      );
    }

    if (!names.has("status")) {
      migrations.push(
        env.DB1.prepare(`
          ALTER TABLE requests
          ADD COLUMN status TEXT NOT NULL DEFAULT 'pending'
        `)
      );
    }

    if (!names.has("reward")) {
      migrations.push(
        env.DB1.prepare(`
          ALTER TABLE requests
          ADD COLUMN reward REAL NOT NULL DEFAULT 0.20
        `)
      );
    }

    if (!names.has("admin_id")) {
      migrations.push(
        env.DB1.prepare(`
          ALTER TABLE requests
          ADD COLUMN admin_id TEXT
        `)
      );
    }

    if (!names.has("admin_note")) {
      migrations.push(
        env.DB1.prepare(`
          ALTER TABLE requests
          ADD COLUMN admin_note TEXT
        `)
      );
    }

    if (!names.has("created_at")) {
      migrations.push(
        env.DB1.prepare(`
          ALTER TABLE requests
          ADD COLUMN created_at INTEGER
        `)
      );
    }

    if (!names.has("reviewed_at")) {
      migrations.push(
        env.DB1.prepare(`
          ALTER TABLE requests
          ADD COLUMN reviewed_at INTEGER
        `)
      );
    }

    for (const migration of migrations) {
      try {
        await migration.run();
      } catch {}
    }

  } catch (error) {
    console.error(
      "Request migration error:",
      error
    );
  }
}


/*
 * =========================================================
 * CONFIG
 * =========================================================
 */

async function ensureConfig(env, key, value) {
  const row = await env.DB1
    .prepare(`
      SELECT key
      FROM app_config
      WHERE key = ?1
      LIMIT 1
    `)
    .bind(key)
    .first();

  if (!row) {
    await env.DB1
      .prepare(`
        INSERT INTO app_config (
          key,
          value,
          updated_at
        )
        VALUES (?1, ?2, ?3)
      `)
      .bind(
        key,
        value,
        Date.now()
      )
      .run();
  }
}


async function getConfig(env, key, fallback = null) {
  const row = await env.DB1
    .prepare(`
      SELECT value
      FROM app_config
      WHERE key = ?1
      LIMIT 1
    `)
    .bind(key)
    .first();

  return row?.value ?? fallback;
}


/*
 * =========================================================
 * PRIMARY ADMIN
 * =========================================================
 */

async function ensurePrimaryAdmin(env) {
  const email = String(
    env.ADMIN_EMAIL || ""
  )
    .trim()
    .toLowerCase();

  const password = String(
    env.ADMIN_PASSWORD || ""
  );

  if (!email || !password) {
    console.warn(
      "ADMIN_EMAIL o ADMIN_PASSWORD no están configurados."
    );

    return;
  }

  let user = await env.DB1
    .prepare(`
      SELECT *
      FROM users
      WHERE lower(email) = ?1
      LIMIT 1
    `)
    .bind(email)
    .first();

  const now = Date.now();

  if (!user) {

    const userId = crypto.randomUUID();

    const passwordHash =
      await hashPassword(password);

    const referralCode =
      createReferralCode();

    await env.DB1
      .prepare(`
        INSERT INTO users (
          id,
          email,
          username,
          password_hash,
          role,
          balance,
          referral_code,
          user_status,
          created_at,
          updated_at
        )
        VALUES (
          ?1,
          ?2,
          ?3,
          ?4,
          'admin',
          0,
          ?5,
          1,
          ?6,
          ?6
        )
      `)
      .bind(
        userId,
        email,
        "admin",
        passwordHash,
        referralCode,
        now
      )
      .run();

    user = await env.DB1
      .prepare(`
        SELECT *
        FROM users
        WHERE id = ?1
        LIMIT 1
      `)
      .bind(userId)
      .first();

  } else {

    /*
     * Promueve automáticamente la cuenta
     * configurada como ADMIN_EMAIL.
     */

    await env.DB1
      .prepare(`
        UPDATE users
        SET
          role = 'admin',
          user_status = 1,
          updated_at = ?2
        WHERE id = ?1
      `)
      .bind(
        user.id,
        now
      )
      .run();

    /*
     * Actualiza la contraseña administrativa
     * únicamente para la cuenta principal.
     */

    const passwordHash =
      await hashPassword(password);

    await env.DB1
      .prepare(`
        UPDATE users
        SET
          password_hash = ?2,
          role = 'admin',
          user_status = 1,
          updated_at = ?3
        WHERE id = ?1
      `)
      .bind(
        user.id,
        passwordHash,
        now
      )
      .run();
  }

  const existingAdmin = await env.DB1
    .prepare(`
      SELECT id
      FROM admin_accounts
      WHERE user_id = ?1
      LIMIT 1
    `)
    .bind(user.id)
    .first();

  const passwordHash =
    await hashPassword(password);

  if (!existingAdmin) {

    await env.DB1
      .prepare(`
        INSERT INTO admin_accounts (
          id,
          user_id,
          password_hash,
          active,
          is_primary,
          created_at,
          updated_at
        )
        VALUES (
          ?1,
          ?2,
          ?3,
          1,
          1,
          ?4,
          ?4
        )
      `)
      .bind(
        crypto.randomUUID(),
        user.id,
        passwordHash,
        now
      )
      .run();

  } else {

    await env.DB1
      .prepare(`
        UPDATE admin_accounts
        SET
          password_hash = ?2,
          active = 1,
          is_primary = 1,
          updated_at = ?3
        WHERE user_id = ?1
      `)
      .bind(
        user.id,
        passwordHash,
        now
      )
      .run();
  }
}


/*
 * =========================================================
 * HEALTH
 * =========================================================
 */

async function handleHealth(env) {
  try {

    const result = await env.DB1
      .prepare(`
        SELECT 1 AS ok
      `)
      .first();

    return json({
      success: true,
      database:
        Number(result?.ok) === 1,
      message:
        "GmailAccounts API funcionando correctamente."
    });

  } catch (error) {

    console.error(
      "Health error:",
      error
    );

    return json(
      {
        success: false,
        database: false,
        error:
          "No se pudo conectar con la base de datos."
      },
      500
    );
  }
}


/*
 * =========================================================
 * REGISTER
 * =========================================================
 */

async function handleRegister(request, env) {
  try {

    const body =
      await request.json();

    const email = String(
      body.email || ""
    )
      .trim()
      .toLowerCase();

    const username = String(
      body.username || ""
    ).trim();

    const password = String(
      body.password || ""
    );

    if (
      !email ||
      !username ||
      !password
    ) {
      return json(
        {
          success: false,
          error:
            "Completa todos los campos."
        },
        400
      );
    }

    if (!isValidEmail(email)) {
      return json(
        {
          success: false,
          error:
            "El correo electrónico no es válido."
        },
        400
      );
    }

    if (
      username.length < 3 ||
      username.length > 32
    ) {
      return json(
        {
          success: false,
          error:
            "El nombre de usuario debe tener entre 3 y 32 caracteres."
        },
        400
      );
    }

    if (password.length < 6) {
      return json(
        {
          success: false,
          error:
            "La contraseña debe tener al menos 6 caracteres."
        },
        400
      );
    }

    const existing = await env.DB1
      .prepare(`
        SELECT id
        FROM users
        WHERE lower(email) = ?1
        LIMIT 1
      `)
      .bind(email)
      .first();

    if (existing) {
      return json(
        {
          success: false,
          error:
            "Ese correo ya está registrado."
        },
        409
      );
    }

    const id =
      crypto.randomUUID();

    const passwordHash =
      await hashPassword(password);

    const referralCode =
      createReferralCode();

    const now =
      Date.now();

    await env.DB1
      .prepare(`
        INSERT INTO users (
          id,
          email,
          username,
          password_hash,
          role,
          balance,
          referral_code,
          user_status,
          created_at,
          updated_at
        )
        VALUES (
          ?1,
          ?2,
          ?3,
          ?4,
          'user',
          0,
          ?5,
          1,
          ?6,
          ?6
        )
      `)
      .bind(
        id,
        email,
        username,
        passwordHash,
        referralCode,
        now
      )
      .run();

    await createNotification(
      env,
      id,
      "system",
      "Cuenta creada",
      "Tu cuenta de GmailAccounts fue creada correctamente."
    );

    const session =
      await createSession(
        env,
        id
      );

    return json({
      success: true,
      user: sanitizeUser({
        id,
        email,
        username,
        role: "user",
        balance: 0,
        referral_code: referralCode,
        user_status: 1
      }),
      token: session.token
    });

  } catch (error) {

    console.error(
      "Register error:",
      error
    );

    return json(
      {
        success: false,
        error:
          "No se pudo crear la cuenta."
      },
      500
    );
  }
}


/*
 * =========================================================
 * LOGIN
 * =========================================================
 */

async function handleLogin(request, env) {
  try {

    const body =
      await request.json();

    const email = String(
      body.email || ""
    )
      .trim()
      .toLowerCase();

    const password = String(
      body.password || ""
    );

    if (!email || !password) {
      return json(
        {
          success: false,
          error:
            "Introduce correo y contraseña."
        },
        400
      );
    }

    const user = await env.DB1
      .prepare(`
        SELECT *
        FROM users
        WHERE lower(email) = ?1
        LIMIT 1
      `)
      .bind(email)
      .first();

    if (!user) {
      return json(
        {
          success: false,
          error:
            "Correo o contraseña incorrectos."
        },
        401
      );
    }

    if (
      Number(user.user_status) !== 1
    ) {
      return json(
        {
          success: false,
          error:
            "Esta cuenta está desactivada."
        },
        403
      );
    }

    const valid =
      await verifyPassword(
        password,
        user.password_hash
      );

    if (!valid) {
      return json(
        {
          success: false,
          error:
            "Correo o contraseña incorrectos."
        },
        401
      );
    }

    /*
     * Si el correo coincide con ADMIN_EMAIL,
     * se garantiza que la cuenta sea admin.
     */

    const adminEmail =
      String(
        env.ADMIN_EMAIL || ""
      )
        .trim()
        .toLowerCase();

    if (
      adminEmail &&
      email === adminEmail
    ) {
      await env.DB1
        .prepare(`
          UPDATE users
          SET role = 'admin',
              updated_at = ?2
          WHERE id = ?1
        `)
        .bind(
          user.id,
          Date.now()
        )
        .run();

      user.role = "admin";
    }

    const session =
      await createSession(
        env,
        user.id
      );

    return json({
      success: true,
      user: sanitizeUser(user),
      token: session.token
    });

  } catch (error) {

    console.error(
      "Login error:",
      error
    );

    return json(
      {
        success: false,
        error:
          "No se pudo iniciar sesión."
      },
      500
    );
  }
}


/*
 * =========================================================
 * LOGOUT
 * =========================================================
 */

async function handleLogout(request, env) {
  const token =
    getAuthToken(request);

  if (token) {
    await deleteSession(
      env,
      token
    );
  }

  return json({
    success: true
  });
}


/*
 * =========================================================
 * ME
 * =========================================================
 */

async function handleMe(request, env) {
  const user =
    await getAuthenticatedUser(
      request,
      env
    );

  if (!user) {
    return json(
      {
        success: false,
        authenticated: false
      },
      401
    );
  }

  return json({
    success: true,
    authenticated: true,
    user: sanitizeUser(user)
  });
}


/*
 * =========================================================
 * USER REQUEST
 * =========================================================
 */

async function handleCreateRequest(
  request,
  env
) {
  const user =
    await requireUser(
      request,
      env
    );

  if (!user) {
    return unauthorized();
  }

  const body =
    await request.json();

  const demoEmail = String(
    body.demo_email ||
    body.email ||
    ""
  )
    .trim()
    .toLowerCase();

  if (!demoEmail) {
    return json(
      {
        success: false,
        error:
          "Introduce el correo solicitado."
      },
      400
    );
  }

  if (!isValidEmail(demoEmail)) {
    return json(
      {
        success: false,
        error:
          "El correo solicitado no es válido."
      },
      400
    );
  }

  const pending =
    await env.DB1
      .prepare(`
        SELECT id
        FROM requests
        WHERE user_id = ?1
        AND status = 'pending'
        LIMIT 1
      `)
      .bind(user.id)
      .first();

  if (pending) {
    return json(
      {
        success: false,
        error:
          "Ya tienes una solicitud pendiente."
      },
      409
    );
  }

  const rewardValue =
    Number(
      await getConfig(
        env,
        "default_reward",
        "0.20"
      )
    );

  const reward =
    Number.isFinite(rewardValue)
      ? rewardValue
      : 0.20;

  const id =
    crypto.randomUUID();

  const now =
    Date.now();

  await env.DB1
    .prepare(`
      INSERT INTO requests (
        id,
        user_id,
        demo_email,
        status,
        reward,
        created_at
      )
      VALUES (
        ?1,
        ?2,
        ?3,
        'pending',
        ?4,
        ?5
      )
    `)
    .bind(
      id,
      user.id,
      demoEmail,
      reward,
      now
    )
    .run();

  return json({
    success: true,
    request: {
      id,
      demo_email: demoEmail,
      status: "pending",
      reward,
      created_at: now
    }
  });
}


/*
 * =========================================================
 * USER REQUESTS
 * =========================================================
 */

async function handleUserRequests(
  request,
  env
) {
  const user =
    await requireUser(
      request,
      env
    );

  if (!user) {
    return unauthorized();
  }

  const result =
    await env.DB1
      .prepare(`
        SELECT
          id,
          demo_email,
          status,
          reward,
          admin_note,
          created_at,
          reviewed_at
        FROM requests
        WHERE user_id = ?1
        ORDER BY created_at DESC
      `)
      .bind(user.id)
      .all();

  return json({
    success: true,
    requests:
      result.results || []
  });
}


/*
 * =========================================================
 * NOTIFICATIONS
 * =========================================================
 */

async function handleUserNotifications(
  request,
  env
) {
  const user =
    await requireUser(
      request,
      env
    );

  if (!user) {
    return unauthorized();
  }

  const result =
    await env.DB1
      .prepare(`
        SELECT *
        FROM notifications
        WHERE user_id = ?1
        ORDER BY created_at DESC
        LIMIT 100
      `)
      .bind(user.id)
      .all();

  return json({
    success: true,
    notifications:
      result.results || []
  });
}


async function handleMarkNotificationsRead(
  request,
  env
) {
  const user =
    await requireUser(
      request,
      env
    );

  if (!user) {
    return unauthorized();
  }

  await env.DB1
    .prepare(`
      UPDATE notifications
      SET read = 1
      WHERE user_id = ?1
    `)
    .bind(user.id)
    .run();

  return json({
    success: true
  });
}


/*
 * =========================================================
 * TRANSACTIONS
 * =========================================================
 */

async function handleUserTransactions(
  request,
  env
) {
  const user =
    await requireUser(
      request,
      env
    );

  if (!user) {
    return unauthorized();
  }

  const result =
    await env.DB1
      .prepare(`
        SELECT *
        FROM transactions
        WHERE user_id = ?1
        ORDER BY created_at DESC
        LIMIT 200
      `)
      .bind(user.id)
      .all();

  return json({
    success: true,
    transactions:
      result.results || []
  });
}


/*
 * =========================================================
 * WITHDRAWALS
 * =========================================================
 */

async function handleCreateWithdrawal(
  request,
  env
) {
  const user =
    await requireUser(
      request,
      env
    );

  if (!user) {
    return unauthorized();
  }

  const body =
    await request.json();

  const amount =
    Number(body.amount);

  const address =
    String(
      body.address || ""
    ).trim();

  if (
    !Number.isFinite(amount) ||
    amount <= 0
  ) {
    return json(
      {
        success: false,
        error:
          "Cantidad inválida."
      },
      400
    );
  }

  if (!address) {
    return json(
      {
        success: false,
        error:
          "Introduce la dirección de retiro."
      },
      400
    );
  }

  const minimum =
    Number(
      await getConfig(
        env,
        "minimum_withdrawal",
        "10"
      )
    );

  if (amount < minimum) {
    return json(
      {
        success: false,
        error:
          `El retiro mínimo es ${minimum}.`
      },
      400
    );
  }

  const freshUser =
    await env.DB1
      .prepare(`
        SELECT *
        FROM users
        WHERE id = ?1
        LIMIT 1
      `)
      .bind(user.id)
      .first();

  const balance =
    Number(freshUser?.balance || 0);

  if (amount > balance) {
    return json(
      {
        success: false,
        error:
          "Saldo insuficiente."
      },
      400
    );
  }

  const existing =
    await env.DB1
      .prepare(`
        SELECT id
        FROM withdrawals
        WHERE user_id = ?1
        AND status = 'pending'
        LIMIT 1
      `)
      .bind(user.id)
      .first();

  if (existing) {
    return json(
      {
        success: false,
        error:
          "Ya tienes un retiro pendiente."
      },
      409
    );
  }

  const id =
    crypto.randomUUID();

  const now =
    Date.now();

  const newBalance =
    roundMoney(
      balance - amount
    );

  await env.DB1.batch([

    env.DB1.prepare(`
      UPDATE users
      SET balance = ?2,
          updated_at = ?3
      WHERE id = ?1
    `).bind(
      user.id,
      newBalance,
      now
    ),

    env.DB1.prepare(`
      INSERT INTO withdrawals (
        id,
        user_id,
        amount,
        address,
        status,
        created_at
      )
      VALUES (
        ?1,
        ?2,
        ?3,
        ?4,
        'pending',
        ?5
      )
    `).bind(
      id,
      user.id,
      amount,
      address,
      now
    ),

    env.DB1.prepare(`
      INSERT INTO transactions (
        id,
        user_id,
        type,
        amount,
        balance_before,
        balance_after,
        reference_id,
        description,
        created_at
      )
      VALUES (
        ?1,
        ?2,
        'withdrawal_pending',
        ?3,
        ?4,
        ?5,
        ?6,
        ?7,
        ?8
      )
    `).bind(
      crypto.randomUUID(),
      user.id,
      -amount,
      balance,
      newBalance,
      id,
      "Retiro solicitado",
      now
    )
  ]);

  return json({
    success: true,
    withdrawal: {
      id,
      amount,
      address,
      status: "pending",
      created_at: now
    },
    balance: newBalance
  });
}


async function handleUserWithdrawals(
  request,
  env
) {
  const user =
    await requireUser(
      request,
      env
    );

  if (!user) {
    return unauthorized();
  }

  const result =
    await env.DB1
      .prepare(`
        SELECT
          id,
          amount,
          address,
          status,
          admin_note,
          created_at,
          reviewed_at
        FROM withdrawals
        WHERE user_id = ?1
        ORDER BY created_at DESC
      `)
      .bind(user.id)
      .all();

  return json({
    success: true,
    withdrawals:
      result.results || []
  });
}


/*
 * =========================================================
 * ADMIN AUTH
 * =========================================================
 */

async function requireAdmin(
  request,
  env
) {
  const user =
    await getAuthenticatedUser(
      request,
      env
    );

  if (!user) {
    return null;
  }

  if (
    user.role !== "admin" ||
    Number(user.user_status) !== 1
  ) {
    return null;
  }

  return user;
}


/*
 * =========================================================
 * ADMIN DASHBOARD
 * =========================================================
 */

async function handleAdminDashboard(
  request,
  env
) {
  const admin =
    await requireAdmin(
      request,
      env
    );

  if (!admin) {
    return unauthorized();
  }

  const [
    users,
    pendingRequests,
    pendingWithdrawals,
    balance
  ] = await Promise.all([

    env.DB1
      .prepare(`
        SELECT COUNT(*) AS count
        FROM users
        WHERE role = 'user'
      `)
      .first(),

    env.DB1
      .prepare(`
        SELECT COUNT(*) AS count
        FROM requests
        WHERE status = 'pending'
      `)
      .first(),

    env.DB1
      .prepare(`
        SELECT COUNT(*) AS count
        FROM withdrawals
        WHERE status = 'pending'
      `)
      .first(),

    env.DB1
      .prepare(`
        SELECT COALESCE(SUM(balance), 0) AS total
        FROM users
      `)
      .first()
  ]);

  return json({
    success: true,
    admin: sanitizeUser(admin),
    stats: {
      users: Number(users?.count || 0),
      pending_requests:
        Number(
          pendingRequests?.count || 0
        ),
      pending_withdrawals:
        Number(
          pendingWithdrawals?.count || 0
        ),
      total_balance:
        Number(
          balance?.total || 0
        )
    }
  });
}


/*
 * =========================================================
 * ADMIN USERS
 * =========================================================
 */

async function handleAdminUsers(
  request,
  env
) {
  const admin =
    await requireAdmin(
      request,
      env
    );

  if (!admin) {
    return unauthorized();
  }

  const url =
    new URL(request.url);

  const search =
    String(
      url.searchParams.get("search") ||
      ""
    ).trim();

  let result;

  if (search) {

    const pattern =
      `%${search}%`;

    result =
      await env.DB1
        .prepare(`
          SELECT
            id,
            email,
            username,
            role,
            balance,
            referral_code,
            referred_by,
            user_status,
            created_at,
            updated_at
          FROM users
          WHERE email LIKE ?1
             OR username LIKE ?1
          ORDER BY created_at DESC
          LIMIT 500
        `)
        .bind(pattern)
        .all();

  } else {

    result =
      await env.DB1
        .prepare(`
          SELECT
            id,
            email,
            username,
            role,
            balance,
            referral_code,
            referred_by,
            user_status,
            created_at,
            updated_at
          FROM users
          ORDER BY created_at DESC
          LIMIT 500
        `)
        .all();
  }

  return json({
    success: true,
    users:
      result.results || []
  });
}


/*
 * =========================================================
 * ADMIN USER STATUS
 * =========================================================
 */

async function handleAdminUserStatus(
  request,
  env
) {
  const admin =
    await requireAdmin(
      request,
      env
    );

  if (!admin) {
    return unauthorized();
  }

  const body =
    await request.json();

  const userId =
    String(
      body.user_id || ""
    );

  const status =
    Number(
      body.status
    );

  if (!userId) {
    return json(
      {
        success: false,
        error:
          "Falta user_id."
      },
      400
    );
  }

  if (
    status !== 0 &&
    status !== 1
  ) {
    return json(
      {
        success: false,
        error:
          "Estado inválido."
      },
      400
    );
  }

  if (userId === admin.id) {
    return json(
      {
        success: false,
        error:
          "No puedes desactivar tu propia cuenta."
      },
      400
    );
  }

  await env.DB1
    .prepare(`
      UPDATE users
      SET
        user_status = ?2,
        updated_at = ?3
      WHERE id = ?1
    `)
    .bind(
      userId,
      status,
      Date.now()
    )
    .run();

  return json({
    success: true
  });
}


/*
 * =========================================================
 * ADMIN REQUESTS
 * =========================================================
 */

async function handleAdminRequests(
  request,
  env
) {
  const admin =
    await requireAdmin(
      request,
      env
    );

  if (!admin) {
    return unauthorized();
  }

  const url =
    new URL(request.url);

  const status =
    url.searchParams.get(
      "status"
    );

  let result;

  if (
    status &&
    [
      "pending",
      "approved",
      "rejected"
    ].includes(status)
  ) {

    result =
      await env.DB1
        .prepare(`
          SELECT
            r.*,
            u.email AS user_email,
            u.username
          FROM requests r
          LEFT JOIN users u
            ON u.id = r.user_id
          WHERE r.status = ?1
          ORDER BY r.created_at DESC
          LIMIT 500
        `)
        .bind(status)
        .all();

  } else {

    result =
      await env.DB1
        .prepare(`
          SELECT
            r.*,
            u.email AS user_email,
            u.username
          FROM requests r
          LEFT JOIN users u
            ON u.id = r.user_id
          ORDER BY r.created_at DESC
          LIMIT 500
        `)
        .all();
  }

  return json({
    success: true,
    requests:
      result.results || []
  });
}


/*
 * =========================================================
 * ADMIN REQUEST ACTION
 * =========================================================
 */

async function handleAdminRequestAction(
  request,
  env
) {
  const admin =
    await requireAdmin(
      request,
      env
    );

  if (!admin) {
    return unauthorized();
  }

  const body =
    await request.json();

  const requestId =
    String(
      body.request_id || ""
    );

  const action =
    String(
      body.action || ""
    ).toLowerCase();

  const note =
    String(
      body.note || ""
    ).trim();

  if (!requestId) {
    return json(
      {
        success: false,
        error:
          "Falta request_id."
      },
      400
    );
  }

  if (
    action !== "approve" &&
    action !== "reject"
  ) {
    return json(
      {
        success: false,
        error:
          "Acción inválida."
      },
      400
    );
  }

  const row =
    await env.DB1
      .prepare(`
        SELECT *
        FROM requests
        WHERE id = ?1
        LIMIT 1
      `)
      .bind(requestId)
      .first();

  if (!row) {
    return json(
      {
        success: false,
        error:
          "Solicitud no encontrada."
      },
      404
    );
  }

  if (row.status !== "pending") {
    return json(
      {
        success: false,
        error:
          "Esta solicitud ya fue procesada."
      },
      409
    );
  }

  const now =
    Date.now();

  if (action === "reject") {

    await env.DB1
      .prepare(`
        UPDATE requests
        SET
          status = 'rejected',
          admin_id = ?2,
          admin_note = ?3,
          reviewed_at = ?4
        WHERE id = ?1
      `)
      .bind(
        requestId,
        admin.id,
        note,
        now
      )
      .run();

    await createNotification(
      env,
      row.user_id,
      "request",
      "Solicitud rechazada",
      note ||
        "Tu solicitud fue rechazada."
    );

    return json({
      success: true,
      status: "rejected"
    });
  }

  /*
   * APROBACIÓN
   */

  const reward =
    Number(row.reward || 0);

  const user =
    await env.DB1
      .prepare(`
        SELECT *
        FROM users
        WHERE id = ?1
        LIMIT 1
      `)
      .bind(row.user_id)
      .first();

  if (!user) {
    return json(
      {
        success: false,
        error:
          "Usuario asociado no encontrado."
      },
      404
    );
  }

  const before =
    Number(user.balance || 0);

  const after =
    roundMoney(
      before + reward
    );

  await env.DB1.batch([

    env.DB1.prepare(`
      UPDATE requests
      SET
        status = 'approved',
        admin_id = ?2,
        admin_note = ?3,
        reviewed_at = ?4
      WHERE id = ?1
    `).bind(
      requestId,
      admin.id,
      note,
      now
    ),

    env.DB1.prepare(`
      UPDATE users
      SET
        balance = ?2,
        updated_at = ?3
      WHERE id = ?1
    `).bind(
      user.id,
      after,
      now
    ),

    env.DB1.prepare(`
      INSERT INTO transactions (
        id,
        user_id,
        type,
        amount,
        balance_before,
        balance_after,
        reference_id,
        description,
        created_at
      )
      VALUES (
        ?1,
        ?2,
        'reward',
        ?3,
        ?4,
        ?5,
        ?6,
        ?7,
        ?8
      )
    `).bind(
      crypto.randomUUID(),
      user.id,
      reward,
      before,
      after,
      requestId,
      "Solicitud aprobada",
      now
    )
  ]);

  await createNotification(
    env,
    user.id,
    "request",
    "Solicitud aprobada",
    `Tu solicitud fue aprobada. Se añadieron ${reward} al saldo.`
  );

  return json({
    success: true,
    status: "approved",
    reward,
    balance: after
  });
}


/*
 * =========================================================
 * PENDING COUNT
 * =========================================================
 */

async function handleAdminPendingRequestCount(
  request,
  env
) {
  const admin =
    await requireAdmin(
      request,
      env
    );

  if (!admin) {
    return unauthorized();
  }

  const result =
    await env.DB1
      .prepare(`
        SELECT COUNT(*) AS count
        FROM requests
        WHERE status = 'pending'
      `)
      .first();

  return json({
    success: true,
    count:
      Number(result?.count || 0)
  });
}


/*
 * =========================================================
 * ADMIN BALANCES
 * =========================================================
 */

async function handleAdminBalances(
  request,
  env
) {
  const admin =
    await requireAdmin(
      request,
      env
    );

  if (!admin) {
    return unauthorized();
  }

  const result =
    await env.DB1
      .prepare(`
        SELECT
          id,
          email,
          username,
          balance,
          updated_at
        FROM users
        ORDER BY balance DESC
        LIMIT 500
      `)
      .all();

  return json({
    success: true,
    balances:
      result.results || []
  });
}


/*
 * =========================================================
 * ADMIN TRANSACTIONS
 * =========================================================
 */

async function handleAdminTransactions(
  request,
  env
) {
  const admin =
    await requireAdmin(
      request,
      env
    );

  if (!admin) {
    return unauthorized();
  }

  const result =
    await env.DB1
      .prepare(`
        SELECT
          t.*,
          u.email AS user_email,
          u.username
        FROM transactions t
        LEFT JOIN users u
          ON u.id = t.user_id
        ORDER BY t.created_at DESC
        LIMIT 500
      `)
      .all();

  return json({
    success: true,
    transactions:
      result.results || []
  });
}


/*
 * =========================================================
 * ADMIN NOTIFICATIONS
 * =========================================================
 */

async function handleAdminNotifications(
  request,
  env
) {
  const admin =
    await requireAdmin(
      request,
      env
    );

  if (!admin) {
    return unauthorized();
  }

  const result =
    await env.DB1
      .prepare(`
        SELECT
          n.*,
          u.email AS user_email,
          u.username
        FROM notifications n
        LEFT JOIN users u
          ON u.id = n.user_id
        ORDER BY n.created_at DESC
        LIMIT 500
      `)
      .all();

  return json({
    success: true,
    notifications:
      result.results || []
  });
}


/*
 * =========================================================
 * ADMIN ACCOUNTS
 * =========================================================
 */

async function handleAdminListAdmins(
  request,
  env
) {
  const admin =
    await requireAdmin(
      request,
      env
    );

  if (!admin) {
    return unauthorized();
  }

  const result =
    await env.DB1
      .prepare(`
        SELECT
          a.id,
          a.user_id,
          a.active,
          a.is_primary,
          a.created_at,
          a.updated_at,
          u.email,
          u.username,
          u.role
        FROM admin_accounts a
        LEFT JOIN users u
          ON u.id = a.user_id
        ORDER BY a.is_primary DESC,
                 a.created_at ASC
      `)
      .all();

  return json({
    success: true,
    admins:
      result.results || []
  });
}


async function handleAdminCreateAdmin(
  request,
  env
) {
  const admin =
    await requireAdmin(
      request,
      env
    );

  if (!admin) {
    return unauthorized();
  }

  const body =
    await request.json();

  const email =
    String(
      body.email || ""
    )
      .trim()
      .toLowerCase();

  const password =
    String(
      body.password || ""
    );

  const username =
    String(
      body.username || ""
    ).trim();

  if (
    !email ||
    !password ||
    !username
  ) {
    return json(
      {
        success: false,
        error:
          "Completa todos los campos."
      },
      400
    );
  }

  if (!isValidEmail(email)) {
    return json(
      {
        success: false,
        error:
          "Correo inválido."
      },
      400
    );
  }

  if (password.length < 6) {
    return json(
      {
        success: false,
        error:
          "La contraseña debe tener al menos 6 caracteres."
      },
      400
    );
  }

  const existing =
    await env.DB1
      .prepare(`
        SELECT *
        FROM users
        WHERE lower(email) = ?1
        LIMIT 1
      `)
      .bind(email)
      .first();

  const now =
    Date.now();

  let userId;

  if (existing) {

    userId =
      existing.id;

    await env.DB1
      .prepare(`
        UPDATE users
        SET
          username = ?2,
          role = 'admin',
          user_status = 1,
          password_hash = ?3,
          updated_at = ?4
        WHERE id = ?1
      `)
      .bind(
        userId,
        username,
        await hashPassword(password),
        now
      )
      .run();

  } else {

    userId =
      crypto.randomUUID();

    await env.DB1
      .prepare(`
        INSERT INTO users (
          id,
          email,
          username,
          password_hash,
          role,
          balance,
          referral_code,
          user_status,
          created_at,
          updated_at
        )
        VALUES (
          ?1,
          ?2,
          ?3,
          ?4,
          'admin',
          0,
          ?5,
          1,
          ?6,
          ?6
        )
      `)
      .bind(
        userId,
        email,
        username,
        await hashPassword(password),
        createReferralCode(),
        now
      )
      .run();
  }

  const adminId =
    crypto.randomUUID();

  await env.DB1
    .prepare(`
      INSERT OR REPLACE INTO admin_accounts (
        id,
        user_id,
        password_hash,
        active,
        is_primary,
        created_at,
        updated_at
      )
      VALUES (
        ?1,
        ?2,
        ?3,
        1,
        0,
        ?4,
        ?4
      )
    `)
    .bind(
      adminId,
      userId,
      await hashPassword(password),
      now
    )
    .run();

  return json({
    success: true,
    admin: {
      id: userId,
      email,
      username
    }
  });
}


/*
 * =========================================================
 * ADMIN STATUS
 * =========================================================
 */

async function handleAdminAdminStatus(
  request,
  env
) {
  const admin =
    await requireAdmin(
      request,
      env
    );

  if (!admin) {
    return unauthorized();
  }

  const body =
    await request.json();

  const userId =
    String(
      body.user_id || ""
    );

  const active =
    Number(
      body.active
    );

  if (!userId) {
    return json(
      {
        success: false,
        error:
          "Falta user_id."
      },
      400
    );
  }

  if (userId === admin.id) {
    return json(
      {
        success: false,
        error:
          "No puedes desactivar tu propia cuenta."
      },
      400
    );
  }

  if (
    active !== 0 &&
    active !== 1
  ) {
    return json(
      {
        success: false,
        error:
          "Estado inválido."
      },
      400
    );
  }

  await env.DB1
    .prepare(`
      UPDATE admin_accounts
      SET
        active = ?2,
        updated_at = ?3
      WHERE user_id = ?1
    `)
    .bind(
      userId,
      active,
      Date.now()
    )
    .run();

  if (active === 0) {
    await env.DB1
      .prepare(`
        UPDATE users
        SET
          role = 'user',
          updated_at = ?2
        WHERE id = ?1
      `)
      .bind(
        userId,
        Date.now()
      )
      .run();
  } else {
    await env.DB1
      .prepare(`
        UPDATE users
        SET
          role = 'admin',
          updated_at = ?2
        WHERE id = ?1
      `)
      .bind(
        userId,
        Date.now()
      )
      .run();
  }

  return json({
    success: true
  });
}


/*
 * =========================================================
 * ADMIN STATS
 * =========================================================
 */

async function handleAdminStats(
  request,
  env
) {
  const admin =
    await requireAdmin(
      request,
      env
    );

  if (!admin) {
    return unauthorized();
  }

  const [
    users,
    requests,
    approved,
    rejected,
    withdrawals,
    totalRewards,
    totalBalance
  ] = await Promise.all([

    env.DB1.prepare(`
      SELECT COUNT(*) AS value
      FROM users
      WHERE role = 'user'
    `).first(),

    env.DB1.prepare(`
      SELECT COUNT(*) AS value
      FROM requests
    `).first(),

    env.DB1.prepare(`
      SELECT COUNT(*) AS value
      FROM requests
      WHERE status = 'approved'
    `).first(),

    env.DB1.prepare(`
      SELECT COUNT(*) AS value
      FROM requests
      WHERE status = 'rejected'
    `).first(),

    env.DB1.prepare(`
      SELECT COUNT(*) AS value
      FROM withdrawals
    `).first(),

    env.DB1.prepare(`
      SELECT COALESCE(
        SUM(amount),
        0
      ) AS value
      FROM transactions
      WHERE type = 'reward'
    `).first(),

    env.DB1.prepare(`
      SELECT COALESCE(
        SUM(balance),
        0
      ) AS value
      FROM users
    `).first()
  ]);

  return json({
    success: true,
    stats: {
      users: Number(users?.value || 0),
      requests:
        Number(requests?.value || 0),
      approved:
        Number(approved?.value || 0),
      rejected:
        Number(rejected?.value || 0),
      withdrawals:
        Number(withdrawals?.value || 0),
      total_rewards:
        Number(totalRewards?.value || 0),
      total_balance:
        Number(totalBalance?.value || 0)
    }
  });
}


/*
 * =========================================================
 * ADMIN CONFIG
 * =========================================================
 */

async function handleAdminGetConfig(
  request,
  env
) {
  const admin =
    await requireAdmin(
      request,
      env
    );

  if (!admin) {
    return unauthorized();
  }

  const result =
    await env.DB1
      .prepare(`
        SELECT key, value, updated_at
        FROM app_config
        ORDER BY key ASC
      `)
      .all();

  const config = {};

  for (
    const row of
    result.results || []
  ) {
    config[row.key] =
      row.value;
  }

  return json({
    success: true,
    config
  });
}


async function handleAdminSetConfig(
  request,
  env
) {
  const admin =
    await requireAdmin(
      request,
      env
    );

  if (!admin) {
    return unauthorized();
  }

  const body =
    await request.json();

  const key =
    String(
      body.key || ""
    ).trim();

  const value =
    String(
      body.value ?? ""
    ).trim();

  if (!key) {
    return json(
      {
        success: false,
        error:
          "Falta la clave de configuración."
      },
      400
    );
  }

  await env.DB1
    .prepare(`
      INSERT INTO app_config (
        key,
        value,
        updated_at
      )
      VALUES (
        ?1,
        ?2,
        ?3
      )
      ON CONFLICT(key)
      DO UPDATE SET
        value = excluded.value,
        updated_at = excluded.updated_at
    `)
    .bind(
      key,
      value,
      Date.now()
    )
    .run();

  return json({
    success: true,
    key,
    value
  });
}


/*
 * =========================================================
 * ADMIN WITHDRAWALS
 * =========================================================
 */

async function handleAdminWithdrawals(
  request,
  env
) {
  const admin =
    await requireAdmin(
      request,
      env
    );

  if (!admin) {
    return unauthorized();
  }

  const result =
    await env.DB1
      .prepare(`
        SELECT
          w.*,
          u.email AS user_email,
          u.username
        FROM withdrawals w
        LEFT JOIN users u
          ON u.id = w.user_id
        ORDER BY w.created_at DESC
        LIMIT 500
      `)
      .all();

  return json({
    success: true,
    withdrawals:
      result.results || []
  });
}


async function handleAdminWithdrawalAction(
  request,
  env
) {
  const admin =
    await requireAdmin(
      request,
      env
    );

  if (!admin) {
    return unauthorized();
  }

  const body =
    await request.json();

  const withdrawalId =
    String(
      body.withdrawal_id || ""
    );

  const action =
    String(
      body.action || ""
    ).toLowerCase();

  const note =
    String(
      body.note || ""
    ).trim();

  if (!withdrawalId) {
    return json(
      {
        success: false,
        error:
          "Falta withdrawal_id."
      },
      400
    );
  }

  if (
    action !== "approve" &&
    action !== "reject"
  ) {
    return json(
      {
        success: false,
        error:
          "Acción inválida."
      },
      400
    );
  }

  const withdrawal =
    await env.DB1
      .prepare(`
        SELECT *
        FROM withdrawals
        WHERE id = ?1
        LIMIT 1
      `)
      .bind(withdrawalId)
      .first();

  if (!withdrawal) {
    return json(
      {
        success: false,
        error:
          "Retiro no encontrado."
      },
      404
    );
  }

  if (
    withdrawal.status !== "pending"
  ) {
    return json(
      {
        success: false,
        error:
          "Este retiro ya fue procesado."
      },
      409
    );
  }

  const now =
    Date.now();

  if (action === "approve") {

    await env.DB1
      .prepare(`
        UPDATE withdrawals
        SET
          status = 'approved',
          admin_id = ?2,
          admin_note = ?3,
          reviewed_at = ?4
        WHERE id = ?1
      `)
      .bind(
        withdrawalId,
        admin.id,
        note,
        now
      )
      .run();

    await createNotification(
      env,
      withdrawal.user_id,
      "withdrawal",
      "Retiro aprobado",
      note ||
        "Tu retiro fue aprobado."
    );

    return json({
      success: true,
      status: "approved"
    });
  }

  /*
   * RECHAZO
   *
   * Devuelve el saldo retenido.
   */

  const user =
    await env.DB1
      .prepare(`
        SELECT *
        FROM users
        WHERE id = ?1
        LIMIT 1
      `)
      .bind(withdrawal.user_id)
      .first();

  if (!user) {
    return json(
      {
        success: false,
        error:
          "Usuario no encontrado."
      },
      404
    );
  }

  const before =
    Number(user.balance || 0);

  const amount =
    Number(
      withdrawal.amount || 0
    );

  const after =
    roundMoney(
      before + amount
    );

  await env.DB1.batch([

    env.DB1.prepare(`
      UPDATE withdrawals
      SET
        status = 'rejected',
        admin_id = ?2,
        admin_note = ?3,
        reviewed_at = ?4
      WHERE id = ?1
    `).bind(
      withdrawalId,
      admin.id,
      note,
      now
    ),

    env.DB1.prepare(`
      UPDATE users
      SET
        balance = ?2,
        updated_at = ?3
      WHERE id = ?1
    `).bind(
      user.id,
      after,
      now
    ),

    env.DB1.prepare(`
      INSERT INTO transactions (
        id,
        user_id,
        type,
        amount,
        balance_before,
        balance_after,
        reference_id,
        description,
        created_at
      )
      VALUES (
        ?1,
        ?2,
        'withdrawal_refund',
        ?3,
        ?4,
        ?5,
        ?6,
        ?7,
        ?8
      )
    `).bind(
      crypto.randomUUID(),
      user.id,
      amount,
      before,
      after,
      withdrawalId,
      "Retiro rechazado y saldo devuelto",
      now
    )
  ]);

  await createNotification(
    env,
    user.id,
    "withdrawal",
    "Retiro rechazado",
    note ||
      "Tu retiro fue rechazado y el saldo fue devuelto."
  );

  return json({
    success: true,
    status: "rejected",
    refunded: amount,
    balance: after
  });
}


/*
 * =========================================================
 * SESSION HELPERS
 * =========================================================
 */

async function createSession(
  env,
  userId
) {
  const token =
    randomToken();

  const tokenHash =
    await sha256(token);

  const id =
    crypto.randomUUID();

  const now =
    Date.now();

  const expiresAt =
    now + SESSION_DURATION;

  await env.DB1
    .prepare(`
      INSERT INTO sessions (
        id,
        user_id,
        token_hash,
        expires_at,
        created_at
      )
      VALUES (
        ?1,
        ?2,
        ?3,
        ?4,
        ?5
      )
    `)
    .bind(
      id,
      userId,
      tokenHash,
      expiresAt,
      now
    )
    .run();

  return {
    token,
    expiresAt
  };
}


async function getAuthenticatedUser(
  request,
  env
) {
  const token =
    getAuthToken(request);

  if (!token) {
    return null;
  }

  const tokenHash =
    await sha256(token);

  const row =
    await env.DB1
      .prepare(`
        SELECT
          u.*,
          s.expires_at
        FROM sessions s
        INNER JOIN users u
          ON u.id = s.user_id
        WHERE s.token_hash = ?1
        LIMIT 1
      `)
      .bind(tokenHash)
      .first();

  if (!row) {
    return null;
  }

  if (
    Number(row.expires_at) <=
    Date.now()
  ) {
    await env.DB1
      .prepare(`
        DELETE FROM sessions
        WHERE token_hash = ?1
      `)
      .bind(tokenHash)
      .run();

    return null;
  }

  return row;
}


async function deleteSession(
  env,
  token
) {
  const hash =
    await sha256(token);

  await env.DB1
    .prepare(`
      DELETE FROM sessions
      WHERE token_hash = ?1
    `)
    .bind(hash)
    .run();
}


/*
 * =========================================================
 * AUTHORIZATION
 * =========================================================
 */

async function requireUser(
  request,
  env
) {
  const user =
    await getAuthenticatedUser(
      request,
      env
    );

  if (!user) {
    return null;
  }

  if (
    Number(user.user_status) !== 1
  ) {
    return null;
  }

  return user;
}


function unauthorized() {
  return json(
    {
      success: false,
      error:
        "No autorizado."
    },
    401
  );
}


/*
 * =========================================================
 * PASSWORD HASHING
 * =========================================================
 */

async function hashPassword(
  password
) {
  const salt =
    crypto.getRandomValues(
      new Uint8Array(16)
    );

  const key =
    await crypto.subtle.importKey(
      "raw",
      new TextEncoder().encode(
        password
      ),
      {
        name: "PBKDF2"
      },
      false,
      [
        "deriveBits"
      ]
    );

  const bits =
    await crypto.subtle.deriveBits(
      {
        name: "PBKDF2",
        salt,
        iterations: 100000,
        hash: "SHA-256"
      },
      key,
      256
    );

  return [
    "pbkdf2",
    "100000",
    "sha256",
    bytesToBase64(salt),
    bytesToBase64(
      new Uint8Array(bits)
    )
  ].join("$");
}


async function verifyPassword(
  password,
  stored
) {
  try {

    const parts =
      String(stored).split("$");

    if (
      parts.length !== 5 ||
      parts[0] !== "pbkdf2"
    ) {
      return false;
    }

    const iterations =
      Number(parts[1]);

    const hash =
      parts[2];

    const salt =
      base64ToBytes(parts[3]);

    const expected =
      base64ToBytes(parts[4]);

    const key =
      await crypto.subtle.importKey(
        "raw",
        new TextEncoder().encode(
          password
        ),
        {
          name: "PBKDF2"
        },
        false,
        [
          "deriveBits"
        ]
      );

    const bits =
      await crypto.subtle.deriveBits(
        {
          name: "PBKDF2",
          salt,
          iterations,
          hash:
            hash.toUpperCase()
        },
        key,
        expected.length * 8
      );

    return timingSafeEqual(
      new Uint8Array(bits),
      expected
    );

  } catch {
    return false;
  }
}


/*
 * =========================================================
 * CRYPTO
 * =========================================================
 */

async function sha256(value) {
  const digest =
    await crypto.subtle.digest(
      "SHA-256",
      new TextEncoder().encode(
        value
      )
    );

  return bytesToHex(
    new Uint8Array(digest)
  );
}


function randomToken() {
  const bytes =
    crypto.getRandomValues(
      new Uint8Array(32)
    );

  return bytesToBase64Url(
    bytes
  );
}


function timingSafeEqual(
  a,
  b
) {
  if (a.length !== b.length) {
    return false;
  }

  let result = 0;

  for (
    let i = 0;
    i < a.length;
    i++
  ) {
    result |=
      a[i] ^ b[i];
  }

  return result === 0;
}


function bytesToHex(bytes) {
  return Array
    .from(bytes)
    .map(
      byte =>
        byte
          .toString(16)
          .padStart(2, "0")
    )
    .join("");
}


function bytesToBase64(bytes) {
  let binary = "";

  for (
    const byte of bytes
  ) {
    binary += String.fromCharCode(
      byte
    );
  }

  return btoa(binary);
}


function bytesToBase64Url(bytes) {
  return bytesToBase64(bytes)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=/g, "");
}


function base64ToBytes(value) {
  const binary =
    atob(value);

  const bytes =
    new Uint8Array(
      binary.length
    );

  for (
    let i = 0;
    i < binary.length;
    i++
  ) {
    bytes[i] =
      binary.charCodeAt(i);
  }

  return bytes;
}


/*
 * =========================================================
 * AUTH TOKEN
 * =========================================================
 */

function getAuthToken(request) {
  const authorization =
    request.headers.get(
      "Authorization"
    );

  if (
    authorization &&
    authorization
      .startsWith("Bearer ")
  ) {
    return authorization
      .slice(7)
      .trim();
  }

  const cookie =
    request.headers.get(
      "Cookie"
    );

  if (!cookie) {
    return null;
  }

  const match =
    cookie.match(
      /(?:^|;\s*)session=([^;]+)/
    );

  return match
    ? decodeURIComponent(match[1])
    : null;
}


/*
 * =========================================================
 * NOTIFICATION
 * =========================================================
 */

async function createNotification(
  env,
  userId,
  type,
  title,
  message
) {
  await env.DB1
    .prepare(`
      INSERT INTO notifications (
        id,
        user_id,
        type,
        title,
        message,
        read,
        created_at
      )
      VALUES (
        ?1,
        ?2,
        ?3,
        ?4,
        ?5,
        0,
        ?6
      )
    `)
    .bind(
      crypto.randomUUID(),
      userId,
      type,
      title,
      message,
      Date.now()
    )
    .run();
}


/*
 * =========================================================
 * USER HELPERS
 * =========================================================
 */

function sanitizeUser(user) {
  return {
    id: user.id,
    email: user.email,
    username: user.username,
    role: user.role,
    balance:
      Number(user.balance || 0),
    referral_code:
      user.referral_code || null,
    referred_by:
      user.referred_by || null,
    user_status:
      Number(
        user.user_status ?? 1
      ),
    created_at:
      user.created_at,
    updated_at:
      user.updated_at
  };
}


function createReferralCode() {
  return (
    "GA-" +
    crypto.randomUUID()
      .replace(/-/g, "")
      .slice(0, 10)
      .toUpperCase()
  );
}


function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    .test(email);
}


function roundMoney(value) {
  return Math.round(
    Number(value) * 100
  ) / 100;
}


/*
 * =========================================================
 * JSON RESPONSE
 * =========================================================
 */

function json(
  data,
  status = 200
) {
  return new Response(
    JSON.stringify(data),
    {
      status,
      headers: {
        "Content-Type":
          "application/json; charset=UTF-8",
        "Cache-Control":
          "no-store"
      }
    }
  );
    }
