# AWS Elastic Beanstalk Deployment Package

## Package Contents

This `aws-deployment` folder contains a production-ready version of your Random Milepost Generator optimized for AWS Elastic Beanstalk deployment.

### Key Features Included
- **Full-stack Node.js application** with Express.js backend
- **Database integration** with Neon PostgreSQL (or fallback to in-memory)
- **AGOL integration** with CORS headers for Experience Builder embedding
- **Production optimizations** for AWS deployment
- **Proper port configuration** for Elastic Beanstalk (port 8080)

### Files Structure
```
aws-deployment/
├── .ebextensions/nodejs.config    # Elastic Beanstalk configuration
├── client/                        # React frontend
├── server/                        # Express.js backend
│   ├── storage-db.ts              # Database storage implementation
│   ├── db.ts                      # Storage adapter
│   └── services/                  # Business logic
├── shared/                        # Shared types and schemas
├── package.json                   # Production dependencies
└── AWS-DEPLOYMENT-README.md       # This file
```

## Deployment Steps

### 1. Database Setup (Recommended)
Create a Neon PostgreSQL database:
1. Go to [neon.tech](https://neon.tech)
2. Create new project: "Random Milepost Generator"
3. Copy connection string

### 2. Create ZIP Package
From the `aws-deployment` folder:
```bash
zip -r random-milepost-generator-aws.zip . -x "*.git*" "node_modules/*" ".DS_Store"
```

### 3. Deploy to Elastic Beanstalk
1. **Go to AWS Elastic Beanstalk Console**
2. **Create New Application**:
   - Application name: `random-milepost-generator`
   - Platform: `Node.js 20 running on 64bit Amazon Linux 2023`
3. **Upload ZIP**: Select your created ZIP file
4. **Configure Environment Variables**:
   - `NODE_ENV`: `production`
   - `DATABASE_URL`: Your Neon connection string (optional)
5. **Deploy**

### 4. Environment Variables
Add these in Beanstalk Configuration → Software → Environment Variables:

**Required:**
- `NODE_ENV`: `production`

**Optional (Database):**
- `DATABASE_URL`: `postgresql://username:password@host:5432/database`

**Optional (AGOL Integration):**
- `FRONTEND_URL`: Your deployed application URL

## Key Changes from Development Version

### Production Optimizations
- **Port Configuration**: Uses port 8080 (Beanstalk default)
- **Static File Serving**: Optimized for production
- **Database Integration**: Automatic fallback to in-memory if no DATABASE_URL
- **Build Process**: Includes TypeScript compilation and bundling

### AGOL Integration Ready
- **CORS Headers**: Configured for ArcGIS Online domains
- **Iframe Support**: Allows embedding in Experience Builder
- **Security Headers**: Proper CSP for AGOL integration

### Database Features
- **Automatic Schema Creation**: Tables created on first run
- **Data Seeding**: Includes your route and bridge data
- **Historical Reports**: Persistent storage for generated points
- **Configuration Persistence**: Settings saved between sessions

## Testing Deployment

After deployment, verify:
1. **Application loads**: Visit your Beanstalk environment URL
2. **Map displays**: ESRI satellite imagery loads properly
3. **Point generation**: Generate random inspection points
4. **PDF downloads**: Export functionality works
5. **Database persistence**: Historical reports are saved

## Troubleshooting

### Common Issues
- **Build Failures**: Check Node.js version is 18 or higher
- **Port Errors**: Ensure your app respects `process.env.PORT`
- **Database Errors**: Verify DATABASE_URL format if using database

### CloudFormation Errors
If you encounter Auto Scaling Group errors:
1. **Delete failed environment** completely
2. **Try different region** (us-east-1 or us-west-2)
3. **Use t3.micro instance** type
4. **Consider AWS Amplify** as alternative

## Cost Estimation

**Without Database:**
- Elastic Beanstalk: ~$15-25/month
- EC2 instance + Load Balancer

**With Neon Database:**
- Elastic Beanstalk: ~$15-25/month
- Neon PostgreSQL: Free tier or ~$19/month
- **Total: ~$15-45/month**

## Alternative Deployment

If Elastic Beanstalk continues having issues, this same package works on:
- **AWS Amplify**: Better for full-stack Node.js apps
- **Railway**: Simple deployment from ZIP
- **Render**: Direct upload support
- **Heroku**: Traditional platform deployment

## AGOL Integration

After deployment, add to Experience Builder:
1. **Create new Experience**
2. **Add URL Widget**
3. **Source URL**: Your deployed application URL
4. **Configure size**: Recommended 800x600 minimum

Your Random Milepost Generator will be accessible both as a standalone application and embedded within your organization's AGOL workflows.

## Support

For deployment issues:
- Check AWS Beanstalk logs in the console
- Verify environment variables are set correctly
- Test database connection if using Neon
- Review CORS settings for AGOL integration