export class AppError extends Error {
  constructor(code) {
    super(code);
    this.name = 'AppError';
    this.code = code;
  }
}
