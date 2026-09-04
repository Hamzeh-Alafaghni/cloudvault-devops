-- Runs once on first init of the files-db Postgres instance.
-- notification-service keeps its own database (database-per-service), but to
-- stay within "two Postgres instances" for local dev it is hosted alongside
-- files-db. In the cloud/k8s design students may split this into its own
-- instance — that trade-off is part of the architecture challenge.
CREATE DATABASE notifdb OWNER files;
