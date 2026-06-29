export class DomainError extends Error {
  constructor(
    message: string,
    public readonly type:
      | "validation"
      | "unauthorized"
      | "forbidden"
      | "not_found"
      | "conflict"
      | "user_friendly" = "user_friendly",
    public readonly details?: unknown,
  ) {
    super(message);
    this.name = new.target.name;
  }
}

export class ValidationError extends DomainError {
  constructor(message: string, details?: unknown) {
    super(message, "validation", details);
  }
}

export class NotFoundError extends DomainError {
  constructor(message: string) {
    super(message, "not_found");
  }
}

export class ConflictError extends DomainError {
  constructor(message: string) {
    super(message, "conflict");
  }
}
