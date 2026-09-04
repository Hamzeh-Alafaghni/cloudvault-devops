# 🧩 Architecture Challenge — Design CloudVault on AWS

> This is a **design problem**, not a tutorial. There are no answers in this repo —
> only the questions, the constraints, and what you must hand in. Use the official
> AWS docs freely; copying someone's finished diagram is not the exercise.

## The scenario
CloudVault runs perfectly on your laptop via `docker compose`. Now design the AWS
(or LocalStack-validated, Free-Tier-shaped) architecture it *would* run in. The
app's data flow is fixed and already implemented:

```
browser → gateway → { auth, files, upload, notification } → Postgres / Redis / S3
                                     ▲
                        thumbnail-worker consumes events (async)
```

That flow is exactly what justifies the network tiers, security groups, and load
balancer you're about to design.

## The three trust boundaries
This system has three trust boundaries: **public traffic**, **application
services**, and **data stores**. Your whole design flows from taking that
seriously.

## Questions you must answer (in your diagram + your Terraform)
1. **Subnet tiers & AZs.** The three trust boundaries imply how many subnet
   *tiers*? Across how many *Availability Zones* (for high availability)? So how
   many subnets total?
2. **Egress without ingress.** Which tier needs **outbound** internet access but
   must **not** be reachable **from** the internet? What single component gives it
   exactly that property?
3. **Security groups (four of them).** You'll design roughly four SGs (load
   balancer, gateway/app, services, data). **Which of them should reference
   another security group as its source** rather than a CIDR block — and why is
   that safer than hard-coding CIDRs?
4. **The front door.** The gateway is the only public entry point. **What AWS
   component sits in front of it, in which subnet, and what listens on 80/443?**
   What does it forward to, and how does it health-check the gateway (hint: the
   gateway already serves `/healthz`)?
5. **Least-privilege S3.** The services read/write **one** S3 bucket. **What is
   the least-privilege way to grant that?** And what should you **never** do
   (hint: long-lived access keys baked into env vars or images)? What's the
   credential-free alternative?

## Required deliverables
- [ ] **An architecture diagram** (draw.io / Excalidraw / Mermaid — your choice)
      showing VPC, subnet tiers across AZs, routing (IGW/NAT), the load balancer,
      where each service runs, and where Postgres/Redis/S3 sit.
- [ ] **A security-group matrix**: a table of **source → destination → port →
      reason** for every allowed flow. Everything not listed is denied by default.
- [ ] **The Terraform that implements it** under [`../terraform`](../terraform)
      (see [`terraform/HINTS.md`](../terraform/HINTS.md)).

## Constraints (read these twice)
- **$0.** Validate against **LocalStack** and stay in the **AWS Free Tier**.
- **No Amazon EKS** — the control plane isn't free. For the Kubernetes milestone
  use **kind/k3d** locally. You may still *design* for a managed cluster on paper.
- **No secrets in Git**, ever.

## A security-group matrix — starter template (fill it in)
| # | Source | Destination | Port | Protocol | Reason |
|---|--------|-------------|------|----------|--------|
| 1 | Internet (0.0.0.0/0) | ??? | 443 | TCP | ??? |
| 2 | ??? (SG ref?) | gateway/app | ??? | TCP | ??? |
| 3 | ??? (SG ref?) | services | ??? | TCP | ??? |
| 4 | ??? (SG ref?) | data (Postgres) | 5432 | TCP | ??? |
| … | | | | | |

> Tip: if a row's Source is a CIDR where it could be a security-group reference,
> ask yourself whether you've just widened your attack surface.
