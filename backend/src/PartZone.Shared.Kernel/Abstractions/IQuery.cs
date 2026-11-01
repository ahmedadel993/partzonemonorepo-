using MediatR;
using PartZone.Shared.Kernel.Results;

namespace PartZone.Shared.Kernel.Abstractions;

public interface IQuery<TResponse> : IRequest<Result<TResponse>>;
public interface IQueryHandler<TQuery, TResponse> : IRequestHandler<TQuery, Result<TResponse>>
    where TQuery : IQuery<TResponse>;
