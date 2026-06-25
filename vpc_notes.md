# VPC Basics

## What is a VPC?
A Virtual Private Cloud (VPC) is a logically isolated network in AWS where resources can be launched securely.

## Components of a VPC

### 1. VPC
A private virtual network in AWS.

### 2. Subnet
A subnet is a smaller network inside a VPC.
- Public Subnet
- Private Subnet

### 3. Internet Gateway (IGW)
Allows communication between the VPC and the Internet.

### 4. Route Table
Defines how network traffic is routed.

## Simple VPC Structure

Internet
   |
Internet Gateway (IGW)
   |
VPC (10.0.0.0/16)
   |
Public Subnet (10.0.1.0/24)
   |
EC2 Instance

## Summary
VPC provides a secure and isolated network in AWS. Subnets divide the network, Internet Gateway provides internet access, and Route Tables manage traffic routing.
