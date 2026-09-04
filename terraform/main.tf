# =============================================================================
# 🧩 terraform/main.tf — ROOT MODULE SKELETON (your graded work).
# =============================================================================
# There are NO working resources in this directory on purpose. Your job is to
# design and implement the AWS architecture described in
# docs/ARCHITECTURE_CHALLENGE.md, wiring the modules below together.
#
# TODO(student): compose the modules. A sketch of the intended wiring:
#
#   module "network" { source = "./modules/network"  ...inputs... }
#   module "iam"     { source = "./modules/iam"      ...inputs... }
#   module "storage" { source = "./modules/storage"  ...inputs... }
#   module "compute" { source = "./modules/compute"  ...inputs... }
#
# HINTS (do not turn these into copied answers):
#   - What is the dependency order between these modules? What must exist before
#     compute can launch (subnets? security groups? an instance profile?)
#   - Keep the ROOT module thin: it wires modules + passes variables. Real
#     resources live inside the modules.
#   - Cost guardrail: everything here must fit AWS Free Tier OR be validated
#     against LocalStack. Do NOT introduce Amazon EKS — its control plane is not
#     free. Use kind/k3d locally for the Kubernetes milestone instead.
# =============================================================================
