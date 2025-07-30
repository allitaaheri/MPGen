# AWS RDS PostgreSQL Setup for Elastic Beanstalk

## Quick Setup Guide

### 1. Create Elastic Beanstalk Application
```bash
eb init random-milepost-generator
eb create production
```

### 2. Add RDS Database
```bash
eb config
```
Add to configuration:
```yaml
Resources:
  AWSEBRDSDatabase:
    Type: AWS::RDS::DBInstance
    Properties:
      DBInstanceClass: db.t3.micro
      Engine: postgres
      AllocatedStorage: 20
```

### 3. Environment Variables (Auto-set by Beanstalk)
- `RDS_HOSTNAME` - Database endpoint
- `RDS_PORT` - Database port (5432)
- `RDS_DB_NAME` - Database name
- `RDS_USERNAME` - Database username  
- `RDS_PASSWORD` - Database password

### 4. Deploy Application
```bash
eb deploy
```

## Cost Estimate
- **RDS db.t3.micro**: ~$15/month
- **20GB storage**: ~$3/month
- **Elastic Beanstalk**: Free tier eligible
- **Total**: ~$18/month

## Benefits vs Neon.tech
✅ **Native AWS integration** - No external dependencies
✅ **Auto-scaling** - Handles traffic spikes
✅ **Backup & recovery** - Automated daily backups
✅ **Security** - VPC isolation, encryption
✅ **Monitoring** - CloudWatch integration
✅ **No cold starts** - Always-on database
✅ **Production ready** - Enterprise-grade reliability

## Migration from Neon
The code is already configured to detect RDS environment variables and automatically connect to AWS RDS instead of Neon.tech when deployed to Elastic Beanstalk.

No code changes needed - just deploy!