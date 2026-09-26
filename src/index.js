const SESSION_DURATION = 7 * 24 * 60 * 60 * 1000;

let schemaReady = false;
let schemaPromise = null;

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    try {
      await ensureSchema(env);

      /*
       * =========================
       * HEALTH
       * =========================
       */

      if (
        url.pathname === "/api/health" &&
        request.method === "GET"
      ) {
        return handleHealth(env);
      }

      /*
       * =========================
       * AUTH
       * =========================
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
       * =========================
       * USER / APP
       * =========================
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
       * =========================
       * ADMIN
       * =========================
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

      /*
       * =========================
       * UNKNOWN API
       * =========================
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
       * =========================
       * PUBLIC ASSETS
       * =========================
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
 * DATABASE SCHEMA
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
        CREATE TABLE IF NOT EXISTS requests (
          id TEXT PRIMARY KEY,
          user_id TEXT NOT NULL,
          demo_email TEXT NOT NULL,
          demo_password TEXT NOT NULL,
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

    const existingReward = await env.DB1
      .prepare(`
        SELECT key
        FROM app_config
        WHERE key = 'default_reward'
        LIMIT 1
      `)
      .first();

    if (!existingReward) {
      await env.DB1
        .prepare(`
          INSERT INTO app_config (
            key,
            value,
            updated_at
          )
          VALUES (
            'default_reward',
            '0.20',
            ?1
          )
        `)
        .bind(Date.now())
        .run();
    }

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
 * HEALTH
 * =========================================================
 */

async function handleHealth(env) {
  try {
    const result = await env.DB1
      .prepare("SELECT 1 AS ok")
      .first();

    return json({
      success: true,
      database: result?.ok === 1,
      message: "GmailAccounts API funcionando correctamente."
    });
  } catch {
    return json(
      {
        success: false,
        database: false,
        error: "No se pudo conectar con la base de datos."
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
    const body = await request.json();

    const email = String(body.email || "")
      .trim()
      .toLowerCase();

    const username = String(body.username || "")
      .trim();

    const password = String(body.password || "");

    if (!email || !username || !password) {
      return json(
        {
          success: false,
          error: "Completa todos los campos."
        },
        400
      );
    }

    if (!isValidEmail(email)) {
      return json(
        {
          success: false,
          error: "El correo electrónico no es válido."
        },
        400
      );
    }

    if (password.length < 8) {
      return json(
        {
          success: false,
          error: "La contraseña debe tener al menos 8 caracteres."
        },
        400
      );
    }

    const adminEmail = getAdminEmail(env);

    if (
      adminEmail &&
      email === adminEmail.toLowerCase()
    ) {
      return json(
        {
          success: false,
          error: "Esta cuenta está reservada para administración."
        },
        403
      );
    }

    const existing = await env.DB1
      .prepare(`
        SELECT id
        FROM users
        WHERE LOWER(email) = ?1
           OR LOWER(username) = LOWER(?2)
        LIMIT 1
      `)
      .bind(email, username)
      .first();

    if (existing) {
      return json(
        {
          success: false,
          error: "El correo o usuario ya está registrado."
        },
        409
      );
    }

    const userId = crypto.randomUUID();
    const referralCode = createReferralCode();
    const now = Date.now();

    const passwordHash =
      await hashPassword(password);

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
          referred_by,
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
          NULL,
          ?6,
          ?6
        )
      `)
      .bind(
        userId,
        email,
        username,
        passwordHash,
        referralCode,
        now
      )
      .run();

    const session =
      await createSession(userId, env);

    return json({
      success: true,
      message: "Cuenta creada correctamente.",
      user: {
        id: userId,
        email,
        username,
        role: "user",
        balance: 0
      },
      session: session.token
    });
  } catch {
    return json(
      {
        success: false,
        error: "No se pudo crear la cuenta."
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
    const body = await request.json();

    const identifier = String(
      body.identifier || ""
    )
      .trim()
      .toLowerCase();

    const password = String(
      body.password || ""
    );

    if (!identifier || !password) {
      return json(
        {
          success: false,
          error: "Completa todos los campos."
        },
        400
      );
    }

    /*
     * PRIMARY ADMIN
     */

    const adminEmail =
      getAdminEmail(env);

    const adminPassword =
      getAdminPassword(env);

    if (
      adminEmail &&
      adminPassword &&
      identifier === adminEmail.toLowerCase() &&
      password === adminPassword
    ) {
      const admin =
        await getOrCreateAdmin(
          env,
          adminEmail
        );

      const session =
        await createSession(
          admin.id,
          env
        );

      return json({
        success: true,
        message:
          "Inicio de sesión administrativo correcto.",
        user: {
          id: admin.id,
          email: admin.email,
          username: admin.username,
          role: "admin",
          balance: admin.balance
        },
        session: session.token
      });
    }

    /*
     * SECONDARY ADMINS
     */

    const secondaryAdmin =
      await env.DB1
        .prepare(`
          SELECT
            u.id,
            u.email,
            u.username,
            u.role,
            u.balance,
            a.password_hash,
            a.active,
            a.is_primary
          FROM admin_accounts a
          INNER JOIN users u
            ON u.id = a.user_id
          WHERE (
            LOWER(u.email) = ?1
            OR LOWER(u.username) = ?1
          )
          AND a.active = 1
          AND u.role = 'admin'
          LIMIT 1
        `)
        .bind(identifier)
        .first();

    if (secondaryAdmin) {
      const valid =
        await verifyPassword(
          password,
          secondaryAdmin.password_hash
        );

      if (!valid) {
        return json(
          {
            success: false,
            error:
              "Usuario o contraseña incorrectos."
          },
          401
        );
      }

      const session =
        await createSession(
          secondaryAdmin.id,
          env
        );

      return json({
        success: true,
        message:
          "Inicio de sesión administrativo correcto.",
        user: {
          id: secondaryAdmin.id,
          email: secondaryAdmin.email,
          username: secondaryAdmin.username,
          role: "admin",
          balance: secondaryAdmin.balance
        },
        session: session.token
      });
    }

    /*
     * NORMAL USER
     */

    const user =
      await env.DB1
        .prepare(`
          SELECT
            id,
            email,
            username,
            password_hash,
            role,
            balance
          FROM users
          WHERE LOWER(email) = ?1
             OR LOWER(username) = ?1
          LIMIT 1
        `)
        .bind(identifier)
        .first();

    if (!user) {
      return json(
        {
          success: false,
          error:
            "Usuario o contraseña incorrectos."
        },
        401
      );
    }

    const passwordCorrect =
      await verifyPassword(
        password,
        user.password_hash
      );

    if (!passwordCorrect) {
      return json(
        {
          success: false,
          error:
            "Usuario o contraseña incorrectos."
        },
        401
      );
    }

    const session =
      await createSession(
        user.id,
        env
      );

    return json({
      success: true,
      message:
        "Inicio de sesión correcto.",
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        role: user.role,
        balance: Number(user.balance || 0)
      },
      session: session.token
    });
  } catch {
    return json(
      {
        success: false,
        error: "No se pudo iniciar sesión."
      },
      500
    );
  }
}


/*
 * =========================================================
 * PRIMARY ADMIN IDENTITY
 * =========================================================
 */

async function getOrCreateAdmin(
  env,
  adminEmail
) {
  let admin =
    await env.DB1
      .prepare(`
        SELECT
          id,
          email,
          username,
          role,
          balance
        FROM users
        WHERE LOWER(email) = ?1
        LIMIT 1
      `)
      .bind(adminEmail.toLowerCase())
      .first();

  if (admin) {
    if (admin.role !== "admin") {
      await env.DB1
        .prepare(`
          UPDATE users
          SET role = 'admin',
              updated_at = ?1
          WHERE id = ?2
        `)
        .bind(
          Date.now(),
          admin.id
        )
        .run();

      admin.role = "admin";
    }

    return admin;
  }

  const id =
    crypto.randomUUID();

  const username =
    adminEmail
      .split("@")[0]
      .replace(/[^a-zA-Z0-9_]/g, "")
      .slice(0, 30) ||
    "admin";

  const referralCode =
    createReferralCode();

  const now =
    Date.now();

  const placeholderPassword =
    await hashPassword(
      crypto.randomUUID()
    );

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
        referred_by,
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
        NULL,
        ?6,
        ?6
      )
    `)
    .bind(
      id,
      adminEmail.toLowerCase(),
      username,
      placeholderPassword,
      referralCode,
      now
    )
    .run();

  return {
    id,
    email: adminEmail.toLowerCase(),
    username,
    role: "admin",
    balance: 0
  };
}


/*
 * =========================================================
 * CURRENT USER
 * =========================================================
 */

async function handleMe(
  request,
  env
) {
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
    user: {
      id: user.id,
      email: user.email,
      username: user.username,
      role: user.role,
      balance: Number(user.balance || 0)
    }
  });
}


/*
 * =========================================================
 * LOGOUT
 * =========================================================
 */

async function handleLogout(
  request,
  env
) {
  const token =
    getSessionToken(request);

  if (token) {
    const tokenHash =
      await hashToken(token);

    await env.DB1
      .prepare(`
        DELETE FROM sessions
        WHERE token_hash = ?1
      `)
      .bind(tokenHash)
      .run();
  }

  return json({
    success: true,
    message:
      "Sesión cerrada correctamente."
  });
}


/*
 * =========================================================
 * CREATE DEMO ACCOUNT REQUEST
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

  if (user.role !== "user") {
    return json(
      {
        success: false,
        error:
          "Esta acción está disponible para cuentas de usuario."
      },
      403
    );
  }

  try {
    const body =
      await request.json();

    const demoEmail =
      String(
        body.demo_email ||
        body.email ||
        ""
      )
        .trim()
        .toLowerCase();

    const demoPassword =
      String(
        body.demo_password ||
        body.password ||
        ""
      );

    if (
      !demoEmail ||
      !demoPassword
    ) {
      return json(
        {
          success: false,
          error:
            "Completa los datos de la cuenta demo."
        },
        400
      );
    }

    if (!isValidEmail(demoEmail)) {
      return json(
        {
          success: false,
          error:
            "El correo demo no es válido."
        },
        400
      );
    }

    /*
     * Evitamos solicitudes idénticas
     * pendientes del mismo usuario.
     */

    const duplicate =
      await env.DB1
        .prepare(`
          SELECT id
          FROM requests
          WHERE user_id = ?1
            AND LOWER(demo_email) = ?2
            AND status = 'pending'
          LIMIT 1
        `)
        .bind(
          user.id,
          demoEmail
        )
        .first();

    if (duplicate) {
      return json(
        {
          success: false,
          error:
            "Ya tienes una solicitud pendiente para esta cuenta demo."
        },
        409
      );
    }

    const reward =
      await getDefaultReward(env);

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
          demo_password,
          status,
          reward,
          admin_id,
          admin_note,
          created_at,
          reviewed_at
        )
        VALUES (
          ?1,
          ?2,
          ?3,
          ?4,
          'pending',
          ?5,
          NULL,
          NULL,
          ?6,
          NULL
        )
      `)
      .bind(
        id,
        user.id,
        demoEmail,
        demoPassword,
        reward,
        now
      )
      .run();

    await createNotification(
      env,
      user.id,
      "request_created",
      "Solicitud enviada",
      `Tu solicitud fue enviada para revisión. Recompensa prevista: +${formatAmount(reward)} USDT.`
    );

    return json({
      success: true,
      message:
        "Solicitud enviada correctamente.",
      request: {
        id,
        status: "pending",
        reward,
        created_at: now
      }
    });
  } catch {
    return json(
      {
        success: false,
        error:
          "No se pudo crear la solicitud."
      },
      500
    );
  }
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

  const rows =
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
        LIMIT 100
      `)
      .bind(user.id)
      .all();

  return json({
    success: true,
    requests: rows.results || []
  });
}


/*
 * =========================================================
 * USER NOTIFICATIONS
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

  const rows =
    await env.DB1
      .prepare(`
        SELECT
          id,
          type,
          title,
          message,
          read,
          created_at
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
      rows.results || []
  });
}


/*
 * =========================================================
 * MARK NOTIFICATIONS READ
 * =========================================================
 */

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
 * USER TRANSACTIONS
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

  const rows =
    await env.DB1
      .prepare(`
        SELECT
          id,
          type,
          amount,
          balance_before,
          balance_after,
          reference_id,
          description,
          created_at
        FROM transactions
        WHERE user_id = ?1
        ORDER BY created_at DESC
        LIMIT 100
      `)
      .bind(user.id)
      .all();

  return json({
    success: true,
    transactions:
      rows.results || []
  });
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
    withdrawals,
    balances
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
        SELECT COALESCE(
          SUM(balance),
          0
        ) AS total
        FROM users
        WHERE role = 'user'
      `)
      .first()
  ]);

  return json({
    success: true,
    stats: {
      users: Number(users?.count || 0),
      pending_requests:
        Number(
          pendingRequests?.count || 0
        ),
      pending_withdrawals:
        Number(
          withdrawals?.count || 0
        ),
      total_balance:
        Number(
          balances?.total || 0
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
      url.searchParams.get("search") || ""
    )
      .trim()
      .toLowerCase();

  let query = `
    SELECT
      id,
      email,
      username,
      role,
      balance,
      referral_code,
      referred_by,
      created_at,
      updated_at
    FROM users
    WHERE 1 = 1
  `;

  const params = [];

  if (search) {
    query += `
      AND (
        LOWER(email) LIKE ?1
        OR LOWER(username) LIKE ?1
      )
    `;

    params.push(`%${search}%`);
  }

  query += `
    ORDER BY created_at DESC
    LIMIT 200
  `;

  const statement =
    env.DB1.prepare(query);

  const rows =
    params.length
      ? await statement.bind(...params).all()
      : await statement.all();

  return json({
    success: true,
    users:
      rows.results || []
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

  try {
    const body =
      await request.json();

    const userId =
      String(body.user_id || "");

    const action =
      String(body.action || "")
        .toLowerCase();

    if (!userId) {
      return json(
        {
          success: false,
          error:
            "Falta el usuario."
        },
        400
      );
    }

    if (
      userId === admin.id
    ) {
      return json(
        {
          success: false,
          error:
            "No puedes modificar tu propia cuenta administrativa."
        },
        403
      );
    }

    /*
     * Para no modificar el esquema
     * original de users, el bloqueo
     * se implementa mediante
     * admin_accounts para admins.
     *
     * Los usuarios normales se
     * controlan con user_status.
     */

    const exists =
      await env.DB1
        .prepare(`
          SELECT id, role
          FROM users
          WHERE id = ?1
          LIMIT 1
        `)
        .bind(userId)
        .first();

    if (!exists) {
      return json(
        {
          success: false,
          error:
            "Usuario no encontrado."
        },
        404
      );
    }

    if (exists.role === "admin") {
      return json(
        {
          success: false,
          error:
            "Los administradores se gestionan desde Administradores."
        },
        400
      );
    }

    if (
      action !== "activate" &&
      action !== "deactivate"
    ) {
      return json(
        {
          success: false,
          error:
            "Acción no válida."
        },
        400
      );
    }

    /*
     * Add the status column only if
     * the existing users table does
     * not have it.
     */

    await ensureUserStatusColumn(env);

    const active =
      action === "activate"
        ? 1
        : 0;

    await env.DB1
      .prepare(`
        UPDATE users
        SET user_status = ?1,
            updated_at = ?2
        WHERE id = ?3
      `)
      .bind(
        active,
        Date.now(),
        userId
      )
      .run();

    return json({
      success: true,
      active: active === 1
    });
  } catch {
    return json(
      {
        success: false,
        error:
          "No se pudo cambiar el estado del usuario."
      },
      500
    );
  }
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
    String(
      url.searchParams.get("status") || ""
    )
      .trim()
      .toLowerCase();

  let query = `
    SELECT
      r.id,
      r.user_id,
      r.demo_email,
      r.demo_password,
      r.status,
      r.reward,
      r.admin_id,
      r.admin_note,
      r.created_at,
      r.reviewed_at,
      u.email AS user_email,
      u.username AS username
    FROM requests r
    INNER JOIN users u
      ON u.id = r.user_id
  `;

  const params = [];

  if (
    status === "pending" ||
    status === "approved" ||
    status === "rejected"
  ) {
    query += `
      WHERE r.status = ?1
    `;

    params.push(status);
  }

  query += `
    ORDER BY r.created_at DESC
    LIMIT 300
  `;

  const statement =
    env.DB1.prepare(query);

  const rows =
    params.length
      ? await statement.bind(...params).all()
      : await statement.all();

  return json({
    success: true,
    requests:
      rows.results || []
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

  try {
    const body =
      await request.json();

    const requestId =
      String(body.request_id || "");

    const action =
      String(body.action || "")
        .trim()
        .toLowerCase();

    const note =
      String(
        body.note || ""
      ).trim();

    let reward;

    if (
      body.reward !== undefined &&
      body.reward !== null &&
      body.reward !== ""
    ) {
      reward =
        Number(body.reward);
    }

    if (!requestId) {
      return json(
        {
          success: false,
          error:
            "Falta la solicitud."
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
            "Acción no válida."
        },
        400
      );
    }

    const target =
      await env.DB1
        .prepare(`
          SELECT
            id,
            user_id,
            demo_email,
            status,
            reward
          FROM requests
          WHERE id = ?1
          LIMIT 1
        `)
        .bind(requestId)
        .first();

    if (!target) {
      return json(
        {
          success: false,
          error:
            "Solicitud no encontrada."
        },
        404
      );
    }

    if (
      target.status !== "pending"
    ) {
      return json(
        {
          success: false,
          error:
            "Esta solicitud ya fue procesada."
        },
        409
      );
    }

    if (
      reward === undefined
    ) {
      reward =
        Number(target.reward || 0);
    }

    if (
      !Number.isFinite(reward) ||
      reward < 0
    ) {
      return json(
        {
          success: false,
          error:
            "La recompensa no es válida."
        },
        400
      );
    }

    const now =
      Date.now();

    if (action === "reject") {
      await env.DB1
        .prepare(`
          UPDATE requests
          SET status = 'rejected',
              admin_id = ?1,
              admin_note = ?2,
              reviewed_at = ?3
          WHERE id = ?4
            AND status = 'pending'
        `)
        .bind(
          admin.id,
          note || null,
          now,
          requestId
        )
        .run();

      await createNotification(
        env,
        target.user_id,
        "request_rejected",
        "Solicitud rechazada",
        note
          ? `Tu solicitud fue rechazada. Motivo: ${note}`
          : "Tu solicitud fue rechazada durante la revisión."
      );

      return json({
        success: true,
        status: "rejected"
      });
    }

    /*
     * APPROVAL
     *
     * The balance and transaction are
     * updated together with the request.
     */

    const user =
      await env.DB1
        .prepare(`
          SELECT
            id,
            balance
          FROM users
          WHERE id = ?1
          LIMIT 1
        `)
        .bind(target.user_id)
        .first();

    if (!user) {
      return json(
        {
          success: false,
          error:
            "El usuario de la solicitud no existe."
        },
        404
      );
    }

    const balanceBefore =
      Number(user.balance || 0);

    const balanceAfter =
      roundMoney(
        balanceBefore + reward
      );

    const updateRequest =
      env.DB1.prepare(`
        UPDATE requests
        SET status = 'approved',
            reward = ?1,
            admin_id = ?2,
            admin_note = ?3,
            reviewed_at = ?4
        WHERE id = ?5
          AND status = 'pending'
      `)
        .bind(
          reward,
          admin.id,
          note || null,
          now,
          requestId
        );

    const updateBalance =
      env.DB1.prepare(`
        UPDATE users
        SET balance = ?1,
            updated_at = ?2
        WHERE id = ?3
      `)
        .bind(
          balanceAfter,
          now,
          target.user_id
        );

    const transaction =
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
      `)
        .bind(
          crypto.randomUUID(),
          target.user_id,
          reward,
          balanceBefore,
          balanceAfter,
          requestId,
          `Recompensa por solicitud aprobada: ${target.demo_email}`,
          now
        );

    await env.DB1.batch([
      updateRequest,
      updateBalance,
      transaction
    ]);

    await createNotification(
      env,
      target.user_id,
      "request_approved",
      "Solicitud aceptada",
      `¡Solicitud aceptada! +${formatAmount(reward)} USDT fueron sumados a tu cuenta.`
    );

    return json({
      success: true,
      status: "approved",
      reward,
      balance: balanceAfter
    });
  } catch {
    return json(
      {
        success: false,
        error:
          "No se pudo procesar la solicitud."
      },
      500
    );
  }
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

  const rows =
    await env.DB1
      .prepare(`
        SELECT
          id,
          email,
          username,
          balance,
          updated_at
        FROM users
        WHERE role = 'user'
        ORDER BY balance DESC
        LIMIT 300
      `)
      .all();

  return json({
    success: true,
    balances:
      rows.results || []
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

  const rows =
    await env.DB1
      .prepare(`
        SELECT
          t.id,
          t.user_id,
          t.type,
          t.amount,
          t.balance_before,
          t.balance_after,
          t.reference_id,
          t.description,
          t.created_at,
          u.email AS user_email,
          u.username
        FROM transactions t
        INNER JOIN users u
          ON u.id = t.user_id
        ORDER BY t.created_at DESC
        LIMIT 500
      `)
      .all();

  return json({
    success: true,
    transactions:
      rows.results || []
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

  const rows =
    await env.DB1
      .prepare(`
        SELECT
          n.id,
          n.user_id,
          n.type,
          n.title,
          n.message,
          n.read,
          n.created_at,
          u.email AS user_email,
          u.username
        FROM notifications n
        INNER JOIN users u
          ON u.id = n.user_id
        ORDER BY n.created_at DESC
        LIMIT 500
      `)
      .all();

  return json({
    success: true,
    notifications:
      rows.results || []
  });
}


/*
 * =========================================================
 * ADMIN LIST
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

  const primaryEmail =
    getAdminEmail(env);

  const rows =
    await env.DB1
      .prepare(`
        SELECT
          u.id,
          u.email,
          u.username,
          u.role,
          a.active,
          a.is_primary,
          a.created_at,
          a.updated_at
        FROM users u
        LEFT JOIN admin_accounts a
          ON a.user_id = u.id
        WHERE u.role = 'admin'
        ORDER BY
          CASE
            WHEN LOWER(u.email) = LOWER(?1)
            THEN 0
            ELSE 1
          END,
          u.created_at ASC
      `)
      .bind(primaryEmail || "")
      .all();

  return json({
    success: true,
    admins:
      rows.results || []
  });
}


/*
 * =========================================================
 * CREATE SECONDARY ADMIN
 * =========================================================
 */

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

  try {
    const body =
      await request.json();

    const email =
      String(body.email || "")
        .trim()
        .toLowerCase();

    const username =
      String(body.username || "")
        .trim();

    const password =
      String(body.password || "");

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

    if (password.length < 8) {
      return json(
        {
          success: false,
          error:
            "La contraseña debe tener al menos 8 caracteres."
        },
        400
      );
    }

    const primaryEmail =
      getAdminEmail(env);

    if (
      primaryEmail &&
      email === primaryEmail.toLowerCase()
    ) {
      return json(
        {
          success: false,
          error:
            "Ese correo pertenece al administrador principal."
        },
        409
      );
    }

    const existing =
      await env.DB1
        .prepare(`
          SELECT id
          FROM users
          WHERE LOWER(email) = ?1
             OR LOWER(username) = LOWER(?2)
          LIMIT 1
        `)
        .bind(
          email,
          username
        )
        .first();

    if (existing) {
      return json(
        {
          success: false,
          error:
            "El correo o usuario ya está registrado."
        },
        409
      );
    }

    const id =
      crypto.randomUUID();

    const now =
      Date.now();

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
          referred_by,
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
          NULL,
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
          0,
          ?4,
          ?4
        )
      `)
      .bind(
        crypto.randomUUID(),
        id,
        passwordHash,
        now
      )
      .run();

    return json({
      success: true,
      message:
        "Administrador creado correctamente.",
      admin: {
        id,
        email,
        username,
        role: "admin",
        active: true,
        is_primary: false
      }
    });
  } catch {
    return json(
      {
        success: false,
        error:
          "No se pudo crear el administrador."
      },
      500
    );
  }
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

  try {
    const body =
      await request.json();

    const userId =
      String(body.user_id || "");

    const action =
      String(body.action || "")
        .trim()
        .toLowerCase();

    if (!userId) {
      return json(
        {
          success: false,
          error:
            "Falta el administrador."
        },
        400
      );
    }

    if (
      userId === admin.id
    ) {
      return json(
        {
          success: false,
          error:
            "No puedes desactivar tu propia cuenta."
        },
        403
      );
    }

    const target =
      await env.DB1
        .prepare(`
          SELECT
            u.id,
            u.email,
            u.role,
            a.is_primary
          FROM users u
          LEFT JOIN admin_accounts a
            ON a.user_id = u.id
          WHERE u.id = ?1
          LIMIT 1
        `)
        .bind(userId)
        .first();

    if (!target) {
      return json(
        {
          success: false,
          error:
            "Administrador no encontrado."
        },
        404
      );
    }

    if (
      target.role !== "admin"
    ) {
      return json(
        {
          success: false,
          error:
            "La cuenta seleccionada no es administrador."
        },
        400
      );
    }

    if (
      Number(target.is_primary || 0) === 1
    ) {
      return json(
        {
          success: false,
          error:
            "El administrador principal está protegido."
        },
        403
      );
    }

    if (
      action !== "activate" &&
      action !== "deactivate"
    ) {
      return json(
        {
          success: false,
          error:
            "Acción no válida."
        },
        400
      );
    }

    const active =
      action === "activate"
        ? 1
        : 0;

    await env.DB1
      .prepare(`
        UPDATE admin_accounts
        SET active = ?1,
            updated_at = ?2
        WHERE user_id = ?3
      `)
      .bind(
        active,
        Date.now(),
        userId
      )
      .run();

    /*
     * If deactivated, invalidate
     * every existing session.
     */

    if (active === 0) {
      await env.DB1
        .prepare(`
          DELETE FROM sessions
          WHERE user_id = ?1
        `)
        .bind(userId)
        .run();
    }

    return json({
      success: true,
      active: active === 1
    });
  } catch {
    return json(
      {
        success: false,
        error:
          "No se pudo cambiar el estado del administrador."
      },
      500
    );
  }
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
    pending,
    rewards,
    transactions
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
      `)
      .first(),

    env.DB1
      .prepare(`
        SELECT COUNT(*) AS count
        FROM requests
        WHERE status = 'approved'
      `)
      .first(),

    env.DB1
      .prepare(`
        SELECT COUNT(*) AS count
        FROM requests
        WHERE status = 'rejected'
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
        SELECT COALESCE(
          SUM(amount),
          0
        ) AS total
        FROM transactions
        WHERE type = 'reward'
      `)
      .first(),

    env.DB1
      .prepare(`
        SELECT COUNT(*) AS count
        FROM transactions
      `)
      .first()
  ]);

  return json({
    success: true,
    stats: {
      users:
        Number(users?.count || 0),
      requests:
        Number(requests?.count || 0),
      approved:
        Number(approved?.count || 0),
      rejected:
        Number(rejected?.count || 0),
      pending:
        Number(pending?.count || 0),
      rewards:
        Number(rewards?.total || 0),
      transactions:
        Number(transactions?.count || 0)
    }
  });
}


/*
 * =========================================================
 * CONFIG
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

  const reward =
    await getDefaultReward(env);

  return json({
    success: true,
    config: {
      default_reward: reward
    }
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

  try {
    const body =
      await request.json();

    const reward =
      Number(
        body.default_reward
      );

    if (
      !Number.isFinite(reward) ||
      reward < 0
    ) {
      return json(
        {
          success: false,
          error:
            "La recompensa no es válida."
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
          'default_reward',
          ?1,
          ?2
        )
        ON CONFLICT(key)
        DO UPDATE SET
          value = excluded.value,
          updated_at = excluded.updated_at
      `)
      .bind(
        String(roundMoney(reward)),
        Date.now()
      )
      .run();

    return json({
      success: true,
      config: {
        default_reward:
          roundMoney(reward)
      }
    });
  } catch {
    return json(
      {
        success: false,
        error:
          "No se pudo guardar la configuración."
      },
      500
    );
  }
}


/*
 * =========================================================
 * AUTH HELPERS
 * =========================================================
 */

async function requireUser(
  request,
  env
) {
  return getAuthenticatedUser(
    request,
    env
  );
}


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

  if (user.role !== "admin") {
    return null;
  }

  /*
   * Primary admin is controlled
   * through Cloudflare secrets.
   *
   * Secondary admins must also be
   * active in admin_accounts.
   */

  const primaryEmail =
    getAdminEmail(env);

  if (
    primaryEmail &&
    user.email.toLowerCase() ===
      primaryEmail.toLowerCase()
  ) {
    return user;
  }

  const adminAccount =
    await env.DB1
      .prepare(`
        SELECT active
        FROM admin_accounts
        WHERE user_id = ?1
        LIMIT 1
      `)
      .bind(user.id)
      .first();

  if (
    !adminAccount ||
    Number(adminAccount.active) !== 1
  ) {
    return null;
  }

  return user;
}


async function getAuthenticatedUser(
  request,
  env
) {
  const token =
    getSessionToken(request);

  if (!token) {
    return null;
  }

  const tokenHash =
    await hashToken(token);

  const now =
    Date.now();

  const session =
    await env.DB1
      .prepare(`
        SELECT
          sessions.id AS session_id,
          sessions.user_id,
          sessions.expires_at,
          users.id,
          users.email,
          users.username,
          users.role,
          users.balance
        FROM sessions
        INNER JOIN users
          ON users.id = sessions.user_id
        WHERE sessions.token_hash = ?1
          AND sessions.expires_at > ?2
        LIMIT 1
      `)
      .bind(
        tokenHash,
        now
      )
      .first();

  if (!session) {
    return null;
  }

  /*
   * Disabled normal users cannot
   * continue using their sessions.
   */

  if (session.role === "user") {
    try {
      await ensureUserStatusColumn(env);

      const status =
        await env.DB1
          .prepare(`
            SELECT user_status
            FROM users
            WHERE id = ?1
            LIMIT 1
          `)
          .bind(session.user_id)
          .first();

      if (
        status &&
        Number(status.user_status) === 0
      ) {
        return null;
      }
    } catch {
      /*
       * Preserve compatibility if
       * the existing users table cannot
       * be altered in the current database.
       */
    }
  }

  return session;
}


function getSessionToken(
  request
) {
  const authorization =
    request.headers.get(
      "Authorization"
    );

  if (
    authorization &&
    authorization.startsWith("Bearer ")
  ) {
    return authorization
      .slice(7)
      .trim();
  }

  const cookieHeader =
    request.headers.get("Cookie");

  if (!cookieHeader) {
    return null;
  }

  const cookies =
    parseCookies(cookieHeader);

  return cookies.session || null;
}


/*
 * =========================================================
 * SESSIONS
 * =========================================================
 */

async function createSession(
  userId,
  env
) {
  const token =
    crypto.randomUUID() +
    crypto.randomUUID();

  const tokenHash =
    await hashToken(token);

  const sessionId =
    crypto.randomUUID();

  const createdAt =
    Date.now();

  const expiresAt =
    createdAt +
    SESSION_DURATION;

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
      sessionId,
      userId,
      tokenHash,
      expiresAt,
      createdAt
    )
    .run();

  return {
    id: sessionId,
    token,
    expiresAt
  };
}


/*
 * =========================================================
 * NOTIFICATIONS
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
 * CONFIG HELPERS
 * =========================================================
 */

async function getDefaultReward(env) {
  const row =
    await env.DB1
      .prepare(`
        SELECT value
        FROM app_config
        WHERE key = 'default_reward'
        LIMIT 1
      `)
      .first();

  const reward =
    Number(
      row?.value ?? 0.20
    );

  if (
    !Number.isFinite(reward) ||
    reward < 0
  ) {
    return 0.20;
  }

  return roundMoney(reward);
}


/*
 * =========================================================
 * USER STATUS COMPATIBILITY
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
  } catch {
    /*
     * SQLite/D1 throws if the column
     * already exists. That is harmless.
     */
  }
}


/*
 * =========================================================
 * PASSWORD / TOKEN HASHING
 * =========================================================
 */

async function hashPassword(
  password
) {
  const encoder =
    new TextEncoder();

  const data =
    encoder.encode(password);

  const hashBuffer =
    await crypto.subtle.digest(
      "SHA-256",
      data
    );

  return bufferToHex(
    hashBuffer
  );
}


async function verifyPassword(
  password,
  storedHash
) {
  const hash =
    await hashPassword(password);

  return hash === storedHash;
}


async function hashToken(
  token
) {
  const encoder =
    new TextEncoder();

  const data =
    encoder.encode(token);

  const hashBuffer =
    await crypto.subtle.digest(
      "SHA-256",
      data
    );

  return bufferToHex(
    hashBuffer
  );
}


function bufferToHex(
  buffer
) {
  return Array.from(
    new Uint8Array(buffer)
  )
    .map((byte) =>
      byte
        .toString(16)
        .padStart(2, "0")
    )
    .join("");
}


/*
 * =========================================================
 * ADMIN SECRETS
 * =========================================================
 */

function getAdminEmail(env) {
  return env.ADMIN_EMAIL
    ? String(
        env.ADMIN_EMAIL
      ).trim()
    : null;
}


function getAdminPassword(env) {
  return env.ADMIN_PASSWORD
    ? String(
        env.ADMIN_PASSWORD
      )
    : null;
}


/*
 * =========================================================
 * UTILITIES
 * =========================================================
 */

function isValidEmail(
  email
) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
    email
  );
}


function createReferralCode() {
  return crypto
    .randomUUID()
    .replace(/-/g, "")
    .slice(0, 10)
    .toUpperCase();
}


function roundMoney(
  value
) {
  return Math.round(
    Number(value) * 100
  ) / 100;
}


function formatAmount(
  value
) {
  return roundMoney(value)
    .toFixed(2);
}


function parseCookies(
  header
) {
  const cookies = {};

  for (
    const part of header.split(";")
  ) {
    const separator =
      part.indexOf("=");

    if (separator === -1) {
      continue;
    }

    const key =
      part
        .slice(0, separator)
        .trim();

    const value =
      part
        .slice(separator + 1)
        .trim();

    try {
      cookies[key] =
        decodeURIComponent(value);
    } catch {
      cookies[key] = value;
    }
  }

  return cookies;
}


function unauthorized() {
  return json(
    {
      success: false,
      error:
        "Sesión no autorizada."
    },
    401
  );
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
