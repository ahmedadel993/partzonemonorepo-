using PartZone.Identity.Domain.Entities;

namespace PartZone.Identity.Application.Interfaces;

public interface ITokenService
{
    string GenerateAccessToken(User user);
    string GenerateRefreshToken();
}
