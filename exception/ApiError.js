class ApiError extends Error {
  constructor(status, reason) {
    super();
    this.status = status;
    this.reason = reason;
  }
  static BadRequestError(reason) {
    return new ApiError(400, reason);
  }
  static UnauthorizedError(reason) {
    return new ApiError(401, reason);
  }
  static ForbiddenError(reason) {
    return new ApiError(403, reason);
  }
  static NotFoundError(reason) {
    return new ApiError(404, reason);
  }
}
module.exports = ApiError;
