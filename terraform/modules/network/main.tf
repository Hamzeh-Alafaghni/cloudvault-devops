# =============================================================================
# 🧩 modules/network — the VPC and its subnet tiers. TODO(student). No resources yet.
# =============================================================================
# This is the foundation of the three-trust-boundary design in
# docs/ARCHITECTURE_CHALLENGE.md.
#
# QUESTIONS TO ANSWER IN CODE:
#   - How many subnet TIERS does "public traffic / app services / data stores"
#     imply, and across how many Availability Zones (for HA)?  => how many subnets total?
#   - Which tier gets a route to an Internet Gateway? Which gets a route to a NAT?
#     Which gets NO internet route at all?
#   - The app tier needs OUTBOUND internet (pull images, reach APIs) but must be
#     UNREACHABLE from the internet. What component gives it exactly that?
#   - What should the data tier's route table look like?
#
# ACCEPTANCE CRITERIA:
#   done when: a diagram + this module agree; public subnets reach the internet,
#   app subnets have egress-only, data subnets are isolated; all across >= 2 AZs.
#
# Fair game: the official AWS VPC docs. Copying a full VPC module is not the point.
# TODO(student): implement resource "aws_vpc" / subnets / route tables / IGW / NAT here.
