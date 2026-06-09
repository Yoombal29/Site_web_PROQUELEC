const ERROR_CATALOG = {
    AUTH_INVALID: { status: 401, message: "Oups ! Ces identifiants ne semblent pas corrects. Pouvez-vous vérifier ?", icon: 'Lock' },
    AUTH_EXPIRED: { status: 403, message: "Votre session a expiré pour votre sécurité. Un petit clic pour vous reconnecter ?", icon: 'Clock' },
    AUTH_DENIED: { status: 403, message: "Désolé, vous n'avez pas les droits pour accéder à cette zone.", icon: 'ShieldAlert' },
    DB_BUSY: { status: 503, message: "Le serveur est un peu essoufflé sous la charge. On réessaie dans quelques secondes ?", icon: 'Activity' },
    GHOST_MODE: { status: 200, message: "Le serveur de données se repose, nous utilisons une copie de sécurité ultra-rapide en attendant.", icon: 'Ghost' },
    DB_CONFLICT: { status: 409, message: "Cette information existe déjà ! Pas besoin de la créer deux fois.", icon: 'Copy' },
    DB_NOT_FOUND: { status: 404, message: "Nous n'avons pas trouvé ce que vous cherchiez. S'est-il volatilisé ?", icon: 'Search' },
    DB_CONSTRAINT: { status: 400, message: "Cette action est impossible car cet élément est lié à d'autres données.", icon: 'Link' },
    VALIDATION_ERROR: { status: 400, message: "Il y a une petite erreur dans les informations saisies. On corrige ça ?", icon: 'Edit' },
    FATAL_STRIKE: { status: 500, message: "Une erreur imprévue est survenue. Notre équipe technique a été alertée automatiquement !", icon: 'Hammer' }
};

class AppError extends Error {
    constructor(code, details = null) {
        const error = ERROR_CATALOG[code] || ERROR_CATALOG['FATAL_STRIKE'];
        super(error.message);
        this.code = code;
        this.status = error.status;
        this.details = details;
        this.icon = error.icon;
    }

    static fromStatus(status, details = null) {
        if (status === 404) return new AppError('DB_NOT_FOUND', details);
        if (status === 401) return new AppError('AUTH_INVALID', details);
        if (status === 403) return new AppError('AUTH_DENIED', details);
        return new AppError('FATAL_STRIKE', details);
    }
}

function handleAppError(err, res) {
    console.error('[SERVER-ERROR]', err);

    const appError = err instanceof AppError ? err : AppError.fromStatus(err.status || 500, err.message);

    const errorBody = {
        success: false,
        code: appError.code,
        message: appError.message,
        icon: appError.icon,
        timestamp: new Date().toISOString()
    };

    if (process.env.NODE_ENV === 'development') {
        errorBody.debug = err.stack;
        errorBody.details = appError.details;
    }

    console.log(`[EMPATHY-LOG] ${appError.code}: ${appError.message}`);
    res.status(appError.status).json(errorBody);
}

module.exports = { AppError, handleAppError, ERROR_CATALOG };
