# Interim Render hosting with synthetic data only, then all-AWS

Until the first customer contract, the MVP is hosted on Render's starter tier (about $45-60 a month) for demos, and moves to all-AWS (Fargate for web, API, and worker, RDS Postgres Multi-AZ, S3, SES) when the contract is signed.
The three hosting options priced out within about 10% of each other in October 2026, so the choice rested on operations effort and control: AWS gives the strongest backups, high availability, and security-review story, but its fixed overhead and operations work are not worth carrying before there is a customer.
The interim host never holds real Employee, Write-up, or tip data: demos run on seeded synthetic Organizations plus Toast and Harri sandbox data, and the move to AWS happens before any real record is entered.

## Consequences

- Web, API, and worker ship as portable Docker containers on plain Postgres with S3-compatible file storage, so the move is a redeploy plus a database dump and restore.
- Integration work against the design partner's Harri account uses sandbox or synthetic data while the app is on Render.
