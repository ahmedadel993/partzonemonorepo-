using Microsoft.AspNetCore.Mvc;
using AppResult = PartZone.Shared.Kernel.Results.Result;
using AppError = PartZone.Shared.Kernel.Results.Error;
using AppErrorType = PartZone.Shared.Kernel.Results.ErrorType;

namespace PartZone.Host.Extensions;

public static class ResultExtensions
{
    public static IResult ToApiResult<T>(this PartZone.Shared.Kernel.Results.Result<T> result)
    {
        if (result.IsSuccess)
            return Results.Ok(result.Value);

        return result.Error.Type switch
        {
            AppErrorType.NotFound     => Results.NotFound(ToProblem(result.Error, 404)),
            AppErrorType.Validation   => Results.UnprocessableEntity(ToProblem(result.Error, 422)),
            AppErrorType.Conflict     => Results.Conflict(ToProblem(result.Error, 409)),
            AppErrorType.Unauthorized => Results.Unauthorized(),
            _                         => Results.Problem(ToProblem(result.Error, 500)),
        };
    }

    private static ProblemDetails ToProblem(AppError error, int status) => new()
    {
        Status = status,
        Title = error.Code,
        Detail = error.Description,
    };
}
