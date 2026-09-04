# =============================================================================
# 🧩 modules/compute — where the services run + the security groups. TODO(student).
# =============================================================================
# QUESTIONS TO ANSWER IN CODE:
#   - You have FOUR security groups to design (e.g. load balancer, gateway/app,
#     services, data). Which of them should reference ANOTHER security group as
#     its source instead of a CIDR block — and why is SG-to-SG safer than a CIDR?
#   - The gateway is the only public entry point. What sits IN FRONT of it, in
#     which subnet, listening on 80/443? What does it forward to?
#   - Where do compute nodes live — public or private subnets? Why?
#   - How do nodes get an identity to call AWS APIs WITHOUT long-lived keys?
#     (coordinate with modules/iam)
#
# COST GUARDRAIL: fit Free Tier (e.g. small instances) or validate against
# LocalStack. Do NOT use Amazon EKS. For the Kubernetes milestone use kind/k3d.
#
# ACCEPTANCE CRITERIA:
#   done when: the security-group matrix (source -> dest -> port -> reason) is
#   documented AND implemented; nothing in the data tier is reachable from the
#   internet; only the front-facing component exposes 80/443.
#
# TODO(student): implement the load balancer, compute (ASG/instances or node group
# for a self-managed cluster), and the four security groups here.
