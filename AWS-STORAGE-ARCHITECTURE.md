# AWS Storage Architecture - Random Milepost Generator

## Data Storage Overview

Your Random Milepost Generator uses a **hybrid storage approach** with clear separation of concerns:

### 1. RDS PostgreSQL Database
**Used for**: Structured constraint data
- Routes (SR 112, 836, 874, 878, 924)
- Bridge locations and exclusion zones
- Maintenance limits and construction areas
- Milepost ranges and configurations
- Generated random point selections
- Historical generation records

**Why RDS**: 
- Relational data with complex queries
- ACID transactions for data integrity
- Automatic backups and scaling
- Integration with highway inspection workflows

### 2. EC2 Instance Local Storage
**Used for**: Temporary file generation
- PDF reports (generated on-demand)
- Excel exports (generated on-demand)
- Static assets (CSS, JS, images)
- Application logs

**File Generation Process**:
1. User requests PDF/Excel export
2. Server queries RDS for inspection points
3. Generates file in memory/temp directory
4. Streams file directly to user download
5. File removed after download (no permanent storage)

## Why This Architecture Works

### Database in RDS:
✅ **Persistent data** - Bridge constraints, routes survive server restarts
✅ **Complex queries** - Find bridges within milepost ranges
✅ **Data integrity** - Transaction support for point generation
✅ **Backup/recovery** - AWS managed snapshots
✅ **Scalability** - Can upgrade database independently

### Files on EC2 Local Storage:
✅ **Temporary nature** - Reports generated fresh each time
✅ **Cost effective** - No S3 storage costs
✅ **Simple architecture** - Direct download, no CDN complexity
✅ **Fast generation** - No network overhead to external storage

## File Storage Locations on EC2:

```
/app/                          (Application root)
├── dist/                      (Static assets - built React app)
├── server/temp/               (Temporary PDF/Excel generation)
└── uploads/                   (If file uploads needed)
```

## No Additional Storage Services Needed:
❌ **S3** - Not needed for temporary report files
❌ **EFS** - Not needed for simple file generation
❌ **EBS volumes** - Default EC2 storage sufficient

## Data Flow Example:
1. **User clicks "Generate PDF Report"**
2. **Server queries RDS** for inspection points on Route 112
3. **PDF generated in memory** using bridge constraint data
4. **File streamed to user** as download
5. **Temporary file deleted** (no permanent storage)

## Cost Impact:
- **RDS storage**: ~$2/month (20GB database)
- **EC2 storage**: Included in instance cost
- **No S3 costs**: Files not permanently stored
- **Total storage cost**: ~$2/month additional

This architecture provides enterprise-grade data persistence for your highway inspection constraints while keeping report generation simple and cost-effective.