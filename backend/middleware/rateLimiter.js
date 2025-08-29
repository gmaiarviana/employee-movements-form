/**
 * Rate Limiter Middleware
 * Protege contra ataques de força bruta limitando tentativas por IP
 */

// Map para armazenar tentativas por IP em memória
const attemptStore = new Map();

/**
 * Cria um middleware de rate limiting configurável
 * @param {number} maxAttempts - Número máximo de tentativas permitidas (padrão: 5)
 * @param {number} windowMs - Janela de tempo em milissegundos (padrão: 15 minutos)
 * @returns {Function} Middleware express
 */
const createRateLimiter = (maxAttempts = 5, windowMs = 15 * 60 * 1000) => {
    return (req, res, next) => {
        const clientIP = req.ip || req.connection.remoteAddress || req.socket.remoteAddress;
        const now = Date.now();
        
        // Obter dados do IP atual
        const ipData = attemptStore.get(clientIP) || {
            attempts: 0,
            resetTime: now + windowMs
        };

        // Verificar se a janela de tempo expirou
        if (now > ipData.resetTime) {
            ipData.attempts = 0;
            ipData.resetTime = now + windowMs;
        }

        // Verificar se excedeu o limite
        if (ipData.attempts >= maxAttempts) {
            const timeRemaining = Math.ceil((ipData.resetTime - now) / 1000);
            
            return res.status(429).json({
                error: 'Muitas tentativas de acesso',
                message: `Limite de ${maxAttempts} tentativas excedido. Tente novamente em ${timeRemaining} segundos.`,
                retryAfter: timeRemaining
            });
        }

        // Incrementar contador de tentativas
        ipData.attempts += 1;
        attemptStore.set(clientIP, ipData);

        // Adicionar headers informativos
        res.set({
            'X-RateLimit-Limit': maxAttempts,
            'X-RateLimit-Remaining': Math.max(0, maxAttempts - ipData.attempts),
            'X-RateLimit-Reset': new Date(ipData.resetTime).toISOString()
        });

        next();
    };
};

/**
 * Limpa tentativas antigas do armazenamento
 * Executa automaticamente a cada 30 minutos
 */
const cleanupOldAttempts = () => {
    const now = Date.now();
    
    for (const [ip, data] of attemptStore.entries()) {
        if (now > data.resetTime) {
            attemptStore.delete(ip);
        }
    }
};

// Executar limpeza a cada 30 minutos
setInterval(cleanupOldAttempts, 30 * 60 * 1000);

/**
 * Middleware padrão para endpoints de autenticação
 * 5 tentativas por 15 minutos
 */
const authRateLimiter = createRateLimiter(5, 15 * 60 * 1000);

/**
 * Função para obter estatísticas do rate limiter (útil para debugging)
 * @returns {Object} Estatísticas do rate limiter
 */
const getStats = () => {
    return {
        totalIPs: attemptStore.size,
        activeAttempts: Array.from(attemptStore.entries()).map(([ip, data]) => ({
            ip: ip.replace(/\d+/g, 'xxx'), // Mascarar IP por privacidade
            attempts: data.attempts,
            resetTime: new Date(data.resetTime).toISOString()
        }))
    };
};

module.exports = {
    createRateLimiter,
    authRateLimiter,
    getStats,
    cleanupOldAttempts
};
