# 🧩 Terraform — Hints (your graded work)

> **Golden rule for this folder:** nothing here provisions real infrastructure yet.
> Every `.tf` file contains only `# TODO` markers and guiding questions. The
> learning is in **you** writing the resources. Copying a finished module defeats
> the purpose.

## What you are building
The Infrastructure-as-Code that implements the AWS design from
[`docs/ARCHITECTURE_CHALLENGE.md`](../docs/ARCHITECTURE_CHALLENGE.md). The
CloudVault app already works locally; Terraform is how you describe the cloud (or
LocalStack) environment it would run in.

## Ground rules & cost guardrail
- **$0 target.** Validate as much as possible against **LocalStack** and keep any
  real AWS usage inside the **Free Tier**.
- **No Amazon EKS.** Its control plane bills by the hour and is *not* free. For the
  Kubernetes milestone use **kind** or **k3d** locally. You can still *design* for
  a managed cluster on paper.
- **No secrets or state in Git.** `*.tfstate`, `.terraform/`, `*.tfvars`, and
  `backend.tf` are git-ignored — keep it that way.

## Suggested order
1. `modules/network` — VPC, subnet tiers, routing (the foundation).
2. `modules/iam` — least-privilege roles the compute layer will assume.
3. `modules/storage` — the private S3 bucket (+ optional managed Postgres).
4. `modules/compute` — the front-facing load balancer, the nodes, and the four
   security groups.
5. Root `main.tf` — wire the modules together; `backend.tf` — remote, locking state.

## Definition of done
- `terraform validate` and `terraform plan` succeed (against LocalStack or AWS).
- The plan matches your architecture diagram and your security-group matrix.
- The S3 bucket is private; the app still uploads/downloads via presigned URLs.
- No long-lived credentials anywhere; identities come from roles.
- State is remote and locked; nothing sensitive is committed.

## Fair-game references (pointing at the manual is a hint, not an answer)
- Terraform: <https://developer.hashicorp.com/terraform/docs>
- AWS VPC design: <https://docs.aws.amazon.com/vpc/latest/userguide/>
- LocalStack + Terraform (`tflocal`): <https://docs.localstack.cloud/user-guide/integrations/terraform/>
