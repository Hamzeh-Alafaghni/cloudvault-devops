# Contributing to CloudVault

## Branching

This repository uses GitHub Flow. Create a short-lived branch from `main`, make focused commits, and open a pull request back to `main`.

Direct pushes to `main` are not part of the workflow. The `main` branch should require a pull request, passing CI, and at least one review before merging.

## Pull requests

- Explain the operational change and its user impact.
- Include validation commands and their results.
- Keep unrelated refactors out of the pull request.
- Update the relevant architecture or runbook documentation when behavior changes.
- Use a clear imperative title, for example `Harden notification service image`.

## Local checks

Run the service test suite before opening a pull request:

```bash
make test
kubectl kustomize k8s/overlays/dev >/tmp/cloudvault-dev.yaml
terraform -chdir=terraform init -backend=false -input=false
terraform -chdir=terraform validate
```

CI runs tests, builds the images, scans them with Trivy, and publishes SHA-tagged images to GHCR after changes merge to `main`.

## Secrets

Never commit `.env`, kubeconfig files, Terraform state, cloud credentials, or generated secret manifests. Use GitHub Actions secrets or a local ignored file instead.
