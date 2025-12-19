class BaseController {
  /**
   * Envoie une réponse de succès standardisée
   */
  success(res, data, message = 'Success', statusCode = 200) {
    return res.status(statusCode).json({
      success: true,
      message,
      data
    });
  }

  /**
   * Envoie une réponse d'erreur standardisée
   */
  error(res, message, statusCode = 400, errors = null) {
    const response = {
      success: false,
      message
    };

    if (errors) {
      response.errors = errors;
    }

    return res.status(statusCode).json(response);
  }

  /**
   * Gère les erreurs de manière uniforme
   */
  handleError(res, error, context = '') {
    console.error(`[${context}] Error:`, error);

    // Erreurs Prisma
    if (error.code === 'P2002') {
      return this.error(res, 'Resource already exists', 409);
    }
    
    if (error.code === 'P2025') {
      return this.error(res, 'Resource not found', 404);
    }

    // Erreurs de validation
    if (error.name === 'ValidationError') {
      return this.error(res, error.message, 400, error.errors);
    }

    // Erreurs d'autorisation
    if (error.message.includes('Not authorized') || error.message.includes('Unauthorized')) {
      return this.error(res, error.message, 403);
    }

    // Erreur 404
    if (error.message.includes('not found') || error.message.includes('Not found')) {
      return this.error(res, error.message, 404);
    }

    // Erreur générique
    return this.error(
      res,
      process.env.NODE_ENV === 'production' 
        ? 'An error occurred' 
        : error.message,
      500
    );
  }

  /**
   * Valide les données requises
   */
  validateRequired(data, requiredFields) {
    const missing = requiredFields.filter(field => !data[field]);
    
    if (missing.length > 0) {
      throw new Error(`Missing required fields: ${missing.join(', ')}`);
    }
  }

  /**
   * Parse un ID en integer et vérifie qu'il est valide
   */
  parseId(id, fieldName = 'id') {
    const parsed = parseInt(id);
    
    if (isNaN(parsed) || parsed <= 0) {
      throw new Error(`Invalid ${fieldName}: must be a positive integer`);
    }
    
    return parsed;
  }
}

export default BaseController;
