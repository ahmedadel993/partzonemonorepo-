namespace PartZone.Shared.Kernel.Results;

public sealed record Error(string Code, string Description, ErrorType Type = ErrorType.Failure)
{
    public static readonly Error None = new(string.Empty, string.Empty, ErrorType.None);
    public static readonly Error NullValue = new("Error.NullValue", "A null value was provided.", ErrorType.Failure);

    public static Error NotFound(string code, string description) => new(code, description, ErrorType.NotFound);
    public static Error Validation(string code, string description) => new(code, description, ErrorType.Validation);
    public static Error Conflict(string code, string description) => new(code, description, ErrorType.Conflict);
    public static Error Unauthorized(string code, string description) => new(code, description, ErrorType.Unauthorized);
}

public enum ErrorType
{
    None,
    Failure,
    Validation,
    NotFound,
    Conflict,
    Unauthorized,
}
