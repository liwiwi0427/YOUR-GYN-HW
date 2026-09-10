# Security Specification & Threat Model

## Data Invariants
1. `HandoverRecord`: Document IDs must be valid alphanumeric strings <= 128 chars. Must contain valid id.
2. `FacultyMember`: Requires valid id and name. Read allowed for authenticated users.
3. `StudentMember`: Requires valid id, studentId, and name.
4. `ClinicalUnit`: Unit code and hospital information must be string types <= 100 chars.
5. `AuditLog`: Immutable logs. Deletions and updates are strictly forbidden.
6. `BackupSnapshot`: Documents represent scheduled hourly backups between Primary (604415246583) and Backup (378528653721) databases.

## The Dirty Dozen Payloads (Rejection Matrix)
1. Injection attack: documentId containing path traversal `/../../etc/passwd` -> REJECTED.
2. Payload exceeding string bounds (> 1000 characters) -> REJECTED.
3. Attempting to overwrite existing AuditLog entries -> REJECTED.
4. Unauthenticated write to `/handover_records` -> REJECTED.
5. Shadow field injection with privilege escalation fields -> REJECTED.
6. Deleting system backup snapshot from `/backups` -> REJECTED.
7. Attempting to delete clinical units without proper authorization -> REJECTED.
8. Malformed backup snapshot missing timestamp -> REJECTED.
9. Empty record payload -> REJECTED.
10. Spoofed author or studentId with script tags -> REJECTED.
11. Altering immutable backup timestamp -> REJECTED.
12. Attempting to list all internal collections without valid structure -> REJECTED.
