# AWS Database Options for Elastic Beanstalk

## Recommended Option: Amazon RDS PostgreSQL

### Why RDS PostgreSQL is Best for Elastic Beanstalk:
- **Native Integration**: Elastic Beanstalk has built-in RDS support
- **Auto-scaling**: Handles traffic spikes automatically
- **Backup & Recovery**: Automated backups and point-in-time recovery
- **Security**: VPC isolation, encryption at rest/transit
- **Monitoring**: CloudWatch integration included
- **Cost-effective**: Pay only for what you use

### Setup Process:
1. **Create RDS Instance** through Elastic Beanstalk console
2. **Environment Variables** automatically configured
3. **Security Groups** handled automatically
4. **Connection Pooling** built-in

## Alternative Options:

### Amazon RDS MySQL
- Similar benefits to PostgreSQL
- Slightly lower cost
- Wide compatibility

### Amazon Aurora Serverless
- Auto-scaling database
- Pay per request
- Best for variable workloads

### DynamoDB (NoSQL)
- Fully managed NoSQL
- Excellent performance
- Requires code changes

## NOT Recommended for Beanstalk:

### S3
- Storage service, not a database
- No SQL capabilities
- Cannot replace PostgreSQL

### EC2 Database
- Manual management required
- No auto-scaling
- Security complexity
- Higher maintenance

## Configuration for RDS PostgreSQL:

```yaml
# .ebextensions/rds.config
Resources:
  AWSEBRDSDatabase:
    Type: AWS::RDS::DBInstance
    Properties:
      DBInstanceClass: db.t3.micro
      DBInstanceIdentifier: rmpg-database
      Engine: postgres
      EngineVersion: "15.4"
      MasterUsername: rmpguser
      MasterUserPassword: !Ref RDSPassword
      AllocatedStorage: 20
      DBName: rmpg
      VPCSecurityGroups:
        - !Ref AWSEBSecurityGroup
```

## Environment Variables (Auto-configured):
- RDS_HOSTNAME
- RDS_PORT (5432)
- RDS_DB_NAME
- RDS_USERNAME
- RDS_PASSWORD

## Cost Estimate:
- **db.t3.micro**: ~$12-15/month
- **20GB storage**: ~$2-3/month
- **Total**: ~$15-18/month for production