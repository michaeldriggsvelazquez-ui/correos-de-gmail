/*
 * =========================================
 * USER MESSAGE SYSTEM
 * =========================================
 *
 * Mensajes automáticos del flujo del usuario.
 *
 * Este archivo NO contiene lógica de interfaz.
 * Solamente define los mensajes que el sistema
 * puede utilizar durante la conversación.
 *
 * Los textos pueden utilizar datos dinámicos
 * proporcionados por el sistema.
 */

const userMessage = {

    /*
     * =========================================
     * INICIO
     * =========================================
     */

    start() {

        return {
            type: "bot",
            event: "start",
            text:
                "¡Perfecto! 🚀 Vamos a comenzar. Primero necesito que introduzcas el correo de Gmail que quieres utilizar para iniciar el proceso."
        };

    },


    /*
     * =========================================
     * CORREO
     * =========================================
     */

    requestEmail() {

        return {
            type: "bot",
            event: "request_email",
            text:
                "📧 Para continuar, introduce el correo de Gmail que quieres utilizar. Asegúrate de escribirlo correctamente antes de enviarlo."
        };

    },


    invalidEmail() {

        return {
            type: "bot",
            event: "invalid_email",
            text:
                "⚠️ Ese correo no tiene un formato válido. Revisa la dirección e intenta nuevamente. El correo debe terminar en @gmail.com."
        };

    },


    emailReceived(email) {

        return {
            type: "bot",
            event: "email_received",
            text:
                `¡Perfecto! ✅ He recibido ${email}. Ahora podemos continuar con el siguiente paso del proceso.`
        };

    },


    /*
     * =========================================
     * CONTRASEÑA / CLAVE DEL FLUJO
     * =========================================
     */

    requestPassword() {

        return {
            type: "bot",
            event: "request_password",
            text:
                "🔐 Ahora introduce la contraseña solicitada para continuar con el proceso. Es necesario completar este paso correctamente antes de avanzar."
        };

    },


    invalidPassword() {

        return {
            type: "bot",
            event: "invalid_password",
            text:
                "❌ La contraseña introducida no es correcta. No podemos avanzar todavía. Revisa lo que has escrito e inténtalo nuevamente."
        };

    },


    passwordAccepted() {

        return {
            type: "bot",
            event: "password_accepted",
            text:
                "🔓 ¡Correcto! La contraseña ha sido aceptada y el proceso puede continuar. 🚀"
        };

    },


    /*
     * =========================================
     * ESPERA
     * =========================================
     */

    waiting() {

        return {
            type: "bot",
            event: "waiting",
            text:
                "⏳ Todo está en orden por ahora. El proceso se encuentra esperando el siguiente paso."
        };

    },


    /*
     * =========================================
     * ERROR GENERAL
     * =========================================
     */

    incomplete() {

        return {
            type: "bot",
            event: "incomplete",
            text:
                "⚠️ Todavía falta completar el paso actual. Completa la información solicitada para poder continuar."
        };

    },


    /*
     * =========================================
     * CANCELACIÓN
     * =========================================
     */

    cancelled() {

        return {
            type: "bot",
            event: "cancelled",
            text:
                "🛑 El proceso ha sido cancelado correctamente. No se continuará con esta solicitud."
        };

    },


    /*
     * =========================================
     * FINALIZACIÓN
     * =========================================
     */

    completed() {

        return {
            type: "bot",
            event: "completed",
            text:
                "🎉 ¡Proceso completado correctamente! Todos los pasos requeridos han sido procesados."
        };

    }

};


export default userMessage;
