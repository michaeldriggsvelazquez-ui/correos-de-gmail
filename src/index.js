export default {
    async fetch(request, env) {
        const url = new URL(request.url);

        /*
         * Servir archivos estáticos desde /public
         */
        if (env.ASSETS) {
            return env.ASSETS.fetch(request);
        }

        return new Response(
            "GmailAccounts Worker activo.",
            {
                status: 200,
                headers: {
                    "Content-Type": "text/plain; charset=UTF-8"
                }
            }
        );
    }
};
