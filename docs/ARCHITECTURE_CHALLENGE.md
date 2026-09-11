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