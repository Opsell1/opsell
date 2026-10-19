# Audit Log chains payload digests so purged records leave no data behind

The Audit Log is append-only and hash-chained per Organization, yet every record has a Retention Period after which it is purged, and an entry's before/after values would otherwise keep a purged Write-up's text alive inside the log.
So each entry's hash covers a digest of its payload, not the payload itself: a Purge deletes the payloads of that record's entries and leaves the digests plus a tombstone (record type, id, purge date), and the chain still verifies end to end.
Entries tied to no record (sign-ins, settings, grants, exports) are kept 7 years.

## Considered Options

- **Keep every entry, payload included, for a fixed 7 years**: simpler, but personal data outlives the record it describes, which defeats the Purge.
- **Delete purged records' entries outright**: removes the data but breaks the hash chain, so tampering and retention can no longer be told apart.

## Consequences

- The verification job checks digests against payloads where payloads exist, and chain continuity everywhere.
- The only database role allowed to null out payloads is the retention job's; the API role still cannot UPDATE or DELETE.
