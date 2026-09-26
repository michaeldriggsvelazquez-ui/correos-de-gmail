const SESSION_DURATION = 7 * 24 * 60 * 60 * 1000;

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

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
     * FUTURAS API
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
  }
};


/*
 * =========================
 * HEALTH
 * =========================
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
 * =========================
 * REGISTER
 * =========================
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

    /*
     * El correo administrativo no puede
     * registrarse mediante el formulario normal.
     */

    const adminEmail = getAdminEmail(env);

    if (adminEmail && email === adminEmail.toLowerCase()) {
      return json(
        {
          success: false,
          error: "Esta cuenta está reservada para administración."
        },
        403
      );
    }

    const existing = await env.DB1
      .prepare(
        `
        SELECT id
        FROM users
        WHERE email = ?1
           OR username = ?2
        LIMIT 1
        `
      )
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

    const passwordHash = await hashPassword(password);

    await env.DB1
      .prepare(
        `
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
        `
      )
      .bind(
        userId,
        email,
        username,
        passwordHash,
        referralCode,
        now
      )
      .run();

    const session = await createSession(
      userId,
      env
    );

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
 * =========================
 * LOGIN
 * =========================
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
     * =========================
     * ADMIN LOGIN
     * =========================
     *
     * Las credenciales reales vienen
     * desde Cloudflare Secrets.
     */

    const adminEmail = getAdminEmail(env);
    const adminPassword = getAdminPassword(env);

    if (
      adminEmail &&
      adminPassword &&
      identifier === adminEmail.toLowerCase() &&
      password === adminPassword
    ) {
      const admin = await getOrCreateAdmin(
        env,
        adminEmail
      );

      const session = await createSession(
        admin.id,
        env
      );

      return json({
        success: true,
        message: "Inicio de sesión administrativo correcto.",
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
     * =========================
     * USER LOGIN
     * =========================
     */

    const user = await env.DB1
      .prepare(
        `
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
        `
      )
      .bind(identifier)
      .first();

    if (!user) {
      return json(
        {
          success: false,
          error: "Usuario o contraseña incorrectos."
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
          error: "Usuario o contraseña incorrectos."
        },
        401
      );
    }

    const session = await createSession(
      user.id,
      env
    );

    return json({
      success: true,
      message: "Inicio de sesión correcto.",
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        role: user.role,
        balance: user.balance
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
 * =========================
 * ADMIN USER
 * =========================
 */

async function getOrCreateAdmin(
  env,
  adminEmail
) {
  let admin = await env.DB1
    .prepare(
      `
      SELECT
        id,
        email,
        username,
        role,
        balance
      FROM users
      WHERE LOWER(email) = ?1
      LIMIT 1
      `
    )
    .bind(adminEmail.toLowerCase())
    .first();

  if (admin) {
    if (admin.role !== "admin") {
      await env.DB1
        .prepare(
          `
          UPDATE users
          SET role = 'admin',
              updated_at = ?1
          WHERE id = ?2
          `
        )
        .bind(
          Date.now(),
          admin.id
        )
        .run();

      admin.role = "admin";
    }

    return admin;
  }

  const id = crypto.randomUUID();
  const username =
    adminEmail
      .split("@")[0]
      .replace(/[^a-zA-Z0-9_]/g, "")
      .slice(0, 30) || "admin";

  const referralCode =
    createReferralCode();

  const now = Date.now();

  /*
   * Esta cuenta se crea únicamente como
   * identidad administrativa interna.
   *
   * La contraseña NO se almacena aquí.
   * La validación se hace mediante
   * ADMIN_PASSWORD de Cloudflare.
   */

  const placeholderPassword =
    await hashPassword(
      crypto.randomUUID()
    );

  await env.DB1
    .prepare(
      `
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
      `
    )
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
 * =========================
 * LOGOUT
 * =========================
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
      .prepare(
        `
        DELETE FROM sessions
        WHERE token_hash = ?1
        `
      )
      .bind(tokenHash)
      .run();
  }

  return json({
    success: true,
    message: "Sesión cerrada correctamente."
  });
}


/*
 * =========================
 * CURRENT USER
 * =========================
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
      balance: user.balance
    }
  });
}


/*
 * =========================
 * SESSIONS
 * =========================
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
    .prepare(
      `
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
      `
    )
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
      .prepare(
        `
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
        `
      )
      .bind(
        tokenHash,
        now
      )
      .first();

  if (!session) {
    return null;
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
 * =========================
 * PASSWORD / TOKEN HASHING
 * =========================
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
 * =========================
 * ADMIN SECRETS
 * =========================
 */

function getAdminEmail(env) {
  return env.ADMIN_EMAIL
    ? String(env.ADMIN_EMAIL).trim()
    : null;
}


function getAdminPassword(env) {
  return env.ADMIN_PASSWORD
    ? String(env.ADMIN_PASSWORD)
    : null;
}


/*
 * =========================
 * UTILITIES
 * =========================
 */

function isValidEmail(email) {
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


function parseCookies(header) {
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

    cookies[key] =
      decodeURIComponent(value);
  }

  return cookies;
}


/*
 * =========================
 * JSON RESPONSE
 * =========================
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
