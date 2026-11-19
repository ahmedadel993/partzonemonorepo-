using System.Globalization;

namespace PartZone.Marketing.Application.Commands;

internal static class ScheduleParsing
{
    /// <summary>
    /// Parses an ISO date-time to UTC. A value with an offset/"Z" is converted;
    /// a value without one is treated as UTC (never as the server's local time,
    /// which differs between dev machines and the hosting server).
    /// Returns null for null/empty/unparseable input.
    /// </summary>
    public static DateTime? ToUtc(string? value) =>
        !string.IsNullOrWhiteSpace(value)
        && DateTime.TryParse(value, CultureInfo.InvariantCulture,
            DateTimeStyles.AssumeUniversal | DateTimeStyles.AdjustToUniversal, out var parsed)
            ? parsed
            : null;
}
