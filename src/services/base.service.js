import prisma from '../config/database.js';

class BaseService {
  constructor(modelName) {
    this.model = prisma[modelName];
    this.modelName = modelName;
  }

  /**
   * Parse un ID et valide qu'il est valide
   */
  parseId(id, fieldName = 'id') {
    const parsed = parseInt(id);
    if (isNaN(parsed) || parsed <= 0) {
      throw new Error(`Invalid ${fieldName}: must be a positive integer`);
    }
    return parsed;
  }

  /**
   * Vérifie qu'une ressource existe
   */
  async findByIdOrFail(id, include = {}) {
    const parsedId = this.parseId(id);
    const resource = await this.model.findUnique({
      where: { id: parsedId },
      include
    });

    if (!resource) {
      throw new Error(`${this.modelName} not found`);
    }

    return resource;
  }

  /**
   * Vérifie les autorisations
   */
  checkAuthorization(resourceOwnerId, userId, userRole, action = 'modify') {
    if (resourceOwnerId !== userId && userRole !== 'ADMIN') {
      throw new Error(`Not authorized to ${action} this ${this.modelName.toLowerCase()}`);
    }
  }

  /**
   * Vérifie qu'une date est valide
   */
  validateDate(dateString, fieldName = 'date') {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      throw new Error(`Invalid ${fieldName}`);
    }
    return date;
  }

  /**
   * Vérifie qu'une valeur est positive
   */
  validatePositive(value, fieldName) {
    const num = parseInt(value);
    if (isNaN(num) || num <= 0) {
      throw new Error(`${fieldName} must be a positive number`);
    }
    return num;
  }

  /**
   * Exécute une transaction Prisma
   */
  async transaction(callback) {
    return await prisma.$transaction(callback);
  }

  /**
   * Select par défaut pour User (éviter fuite de données)
   */
  get userSelect() {
    return {
      id: true,
      username: true,
      email: true,
      role: true
    };
  }
}

export default BaseService;
