/*
 * =========================================
 * ADMIN MESSAGE SYSTEM
 * =========================================
 *
 * IMPORTANTE:
 *
 * Estos NO son mensajes escritos manualmente
 * por el administrador.
 *
 * Son respuestas y componentes generados
 * automáticamente por el sistema cuando ocurre
 * una acción administrativa.
 *
 * admin.html solamente ejecuta la acción.
 * Este archivo determina el mensaje que debe
 * mostrarse después.
 */


/*
 * =========================================
 * NUEVA SOLICITUD
 * =========================================
 */

function newRequest(user) {

    return {
        type: "admin_request",
        event: "new_request",

        title:
            "📋 Nueva solicitud pendiente",

        text:
            "Hay una nueva solicitud esperando revisión.",

        user: {
            id: user.id,
            username: user.username,
            email: user.email
        },

        actions: [
            {
                id: "approve",
                label: "Aceptar",
                type: "success"
            },

            {
                id: "reject",
                label: "Rechazar",
                type: "danger"
            }
        ]
    };

}


/*
 * =========================================
 * CUENTA EN REVISIÓN
 * =========================================
 */

function accountReview(user) {

    return {
        type: "admin_request",
        event: "account_review",

        title:
            "🔎 Nueva cuenta en revisión",

        text:
            "Una nueva cuenta necesita ser revisada antes de continuar.",

        user: {
            id: user.id,
            username: user.username,
            email: user.email
        },

        actions: [
            {
                id: "approve",
                label: "Aceptar",
                type: "success"
            },

            {
                id: "reject",
                label: "Rechazar",
                type: "danger"
            }
        ]
    };

}


/*
 * =========================================
 * CUENTA APROBADA
 * =========================================
 */

function accountApproved(user) {

    return {
        type: "system",
        event: "account_approved",

        title:
            "✅ Cuenta aprobada",

        text:
            `La cuenta de ${user.username} ha sido aprobada correctamente. La solicitud ya puede continuar con el siguiente paso.`,

        user: {
            id: user.id,
            username: user.username,
            email: user.email
        }
    };

}


/*
 * =========================================
 * CUENTA RECHAZADA
 * =========================================
 */

function accountRejected(user) {

    return {
        type: "system",
        event: "account_rejected",

        title:
            "❌ Cuenta rechazada",

        text:
            `La cuenta de ${user.username} ha sido rechazada correctamente. La solicitud ha quedado marcada como rechazada.`,

        user: {
            id: user.id,
            username: user.username,
            email: user.email
        }
    };

}


/*
 * =========================================
 * SALDO AÑADIDO
 * =========================================
 */

function balanceAdded(user, amount) {

    return {
        type: "system",
        event: "balance_added",

        title:
            "💰 Saldo actualizado",

        text:
            `Se han añadido ${amount} USDT al saldo de ${user.username}. La operación ha sido registrada correctamente.`,

        user: {
            id: user.id,
            username: user.username,
            email: user.email
        },

        amount
    };

}


/*
 * =========================================
 * SOLICITUD PENDIENTE
 * =========================================
 */

function requestPending(user) {

    return {
        type: "system",
        event: "request_pending",

        title:
            "⏳ Solicitud en revisión",

        text:
            `La solicitud de ${user.username} se encuentra actualmente en revisión. El sistema actualizará su estado cuando se complete la revisión.`,

        user: {
            id: user.id,
            username: user.username,
            email: user.email
        }
    };

}


/*
 * =========================================
 * SOPORTE RECIBIDO
 * =========================================
 */

function supportReceived(user) {

    return {
        type: "support",
        event: "support_received",

        title:
            "💬 Solicitud de soporte recibida",

        text:
            `Hemos recibido correctamente la solicitud de soporte de ${user.username}. El mensaje ha quedado registrado para su revisión.`,

        user: {
            id: user.id,
            username: user.username,
            email: user.email
        }
    };

}


/*
 * =========================================
 * EXPORTACIÓN
 * =========================================
 */

const adminMessage = {

    newRequest,
    accountReview,
    accountApproved,
    accountRejected,
    balanceAdded,
    requestPending,
    supportReceived

};


export default adminMessage;
