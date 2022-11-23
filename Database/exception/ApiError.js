class ApiError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
    this.message = message;
  }
  static BadRequestError(message) {
    return new ApiError(400, message);
  }
  static UnauthorizedError(message) {
    return new ApiError(401, message);
  }
  static ForbiddenError(message) {
    return new ApiError(403, message);
  }
  static NotFoundError(message) {
    return new ApiError(404, message);
  }
  static InternalServerError(message) {
    return new ApiError(500, message);
  }
}
module.exports = new ApiError();
