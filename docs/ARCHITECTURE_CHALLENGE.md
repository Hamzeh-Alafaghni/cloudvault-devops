Internet
    │
Internet Gateway
    │
Application Load Balancer
    │
    ├───────────────┐                  
Availability      Availability
Zone A            Zone B
    │               │                   
Public Subnet     Public Subnet
    │               │                  
Private App       Private App
Subnet A          Subnet B
    │               │             
Private Data      Private Data
Subnet A          Subnet B
    │               │
    └───────┬───────┘
       S3 Storage

## Security-group matrix

Security groups follow the traffic direction in the diagram. Database and cache
tiers accept traffic only from the service tier; the application tier is never
directly exposed to the internet.

| Source | Destination | Port | Reason |
|---|---|---:|---|
| Internet | ALB | 80, 443 | Public HTTP/HTTPS entry point |
| ALB | App tier | 8080 | Forward gateway traffic from the load balancer |
| App tier | Service tier | 3001-3005 | Reach the internal application services |
| Service tier | Data tier | 5432 | Auth/files/notification PostgreSQL connections |
| Service tier | Data tier | 6379 | Redis Streams event transport |
| App/service tiers | S3 endpoint | 443 | Object upload and presigned-download support |
| App tier | Internet via NAT | 443 | Outbound package and external API access without inbound exposure |

The ALB security group permits inbound 80/443 from the internet and forwards
only to the app security group. The app security group permits traffic from the
ALB security group, the service security group permits traffic from the app
security group, and the data security group permits only PostgreSQL and Redis
from the service security group. No data-tier rule uses `0.0.0.0/0`.