# Correct AWS Elastic Beanstalk Deployment Process

## DO NOT modify rds.config with CloudFormation syntax

The current rds.config is correct as-is:
```yaml
option_settings:
  aws:rds:dbinstance:
    DBInstanceClass: db.t3.micro
    DBEngine: postgres
    DBEngineVersion: "15.4"
    MultiAZDatabase: false
    DBAllocatedStorage: 20
    DBDeletionPolicy: Delete
```

## Correct Database Setup Process:

### 1. Create Environment in AWS Console
- Go to Elastic Beanstalk
- Create new application: "Random-Milepost-Generator"
- Choose "Web server environment"
- Platform: Node.js 20 (updated)
- Upload your ZIP file

### 2. Add Database During Environment Creation
In the "Configure more options" section:
- Click "Database" 
- Engine: **PostgreSQL**
- Version: **15.4**
- Instance class: **db.t3.micro**
- Storage: **20 GB**
- Username: **rmpguser** (or your choice)
- Password: **Your secure password**
- Retention: **Create snapshot**

### 3. Environment Variables (Auto-Created)
Beanstalk automatically creates these:
- `RDS_HOSTNAME` - Database endpoint
- `RDS_PORT` - 5432
- `RDS_DB_NAME` - ebdb (default)
- `RDS_USERNAME` - rmpguser
- `RDS_PASSWORD` - Your password

### 4. Your Code Auto-Detects RDS
The application automatically detects these environment variables and connects to RDS instead of local database.

## Why This Approach Works:
✅ No YAML validation errors
✅ AWS manages all database configuration
✅ Environment variables auto-configured
✅ Your code automatically connects
✅ Production-ready setup

## Cost: ~$25-35/month total
- EC2: ~$8-12/month
- RDS: ~$15-20/month
- Storage/Transfer: ~$2-5/month