using Path = System.IO.Path;

namespace PartZone.Host.Extensions;

/// <summary>
/// Admin image uploads (product images, page-block banners, …).
/// Files are stored under wwwroot/uploads and served by UseStaticFiles().
/// </summary>
public static class UploadEndpoints
{
    private const long MaxBytes = 5 * 1024 * 1024; // 5 MB

    // SVG is deliberately excluded: it can carry script.
    private static readonly Dictionary<string, string> AllowedTypes = new(StringComparer.OrdinalIgnoreCase)
    {
        ["image/jpeg"] = ".jpg",
        ["image/png"] = ".png",
        ["image/webp"] = ".webp",
        ["image/gif"] = ".gif",
    };

    public static IEndpointRouteBuilder MapUploadEndpoints(this IEndpointRouteBuilder app)
    {
        app.MapPost("/api/v1/admin/uploads", UploadAsync)
            .RequireAuthorization("Admin")
            // JWT bearer auth (no cookies), so antiforgery tokens are not needed.
            .DisableAntiforgery()
            .WithTags("Uploads");

        return app;
    }

    private static async Task<IResult> UploadAsync(
        IFormFile file,
        HttpRequest request,
        IWebHostEnvironment env,
        IConfiguration config,
        CancellationToken ct)
    {
        if (file.Length == 0)
            return Results.BadRequest(new { error = "The file is empty." });
        if (file.Length > MaxBytes)
            return Results.BadRequest(new { error = "The file is larger than 5 MB." });
        if (!AllowedTypes.TryGetValue(file.ContentType, out var extension))
            return Results.BadRequest(new { error = "Only JPEG, PNG, WebP and GIF images are allowed." });

        var webRoot = env.WebRootPath ?? Path.Combine(env.ContentRootPath, "wwwroot");
        var folder = Path.Combine(webRoot, "uploads");
        Directory.CreateDirectory(folder);

        // Never use the client file name — generate our own.
        var fileName = $"{Guid.NewGuid():N}{extension}";
        await using (var stream = File.Create(Path.Combine(folder, fileName)))
            await file.CopyToAsync(stream, ct);

        // Absolute URL so the storefront (other origin) can load it.
        // Media:PublicBaseUrl overrides the request host (e.g. behind a dev proxy).
        var baseUrl = config["Media:PublicBaseUrl"]?.TrimEnd('/')
            ?? $"{request.Scheme}://{request.Host}";

        return Results.Ok(new { url = $"{baseUrl}/uploads/{fileName}" });
    }
}
