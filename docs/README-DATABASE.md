# Al-Sader Wal-Wared - Database Setup Guide for Namecheap
#### Developed by Ghaith Boheme

This guide details how to set up, secure, and maintain your MySQL database for the Al-Sader Wal-Wared document management system on Namecheap shared hosting.

## Table of Contents

1. [Namecheap MySQL Database Setup](#namecheap-mysql-database-setup)
2. [Security Best Practices](#security-best-practices)
3. [Database Schema Installation](#database-schema-installation)
4. [Backup and Recovery](#backup-and-recovery)
5. [Environment Configuration](#environment-configuration)
6. [Troubleshooting](#troubleshooting)

## Namecheap MySQL Database Setup

### Creating a MySQL Database in cPanel

1. Log in to your Namecheap cPanel account
2. In the "Databases" section, click on "MySQL Databases"
3. Create a new database:
   - Enter a name (e.g., `alsader_walwared_db`) in the "New Database" field
   - Click "Create Database"
4. Create a database user:
   - Scroll down to "MySQL Users" section
   - Enter a username (e.g., `alsader_user`) 
   - Enter a strong password (use the password generator for a secure option)
   - Click "Create User"
5. Add the user to the database:
   - Scroll down to "Add User To Database"
   - Select your user and database from the dropdown menus
   - Click "Add"
   - On the privileges page, select "ALL PRIVILEGES" and click "Make Changes"

### Obtaining Database Connection Details

Make note of these details for your configuration:

- **Hostname**: Usually `localhost` for shared hosting
- **Database Name**: The name you created (e.g., `alsader_walwared_db`)
- **Username**: The database user you created (e.g., `alsader_user`)
- **Password**: The password you assigned to the user
- **Port**: Usually `3306` (MySQL default port)

## Security Best Practices

### Secure Database User Settings

1. **Use limited privileges** when possible:
   - For the application, consider using separate users for read operations vs. write operations
   - Only grant necessary privileges (SELECT, INSERT, UPDATE, DELETE)
   - Avoid using the 'ALL PRIVILEGES' option in production

2. **Use strong, unique passwords**:
   - Minimum 16 characters
   - Mix of uppercase, lowercase, numbers, and special characters
   - Never reuse database passwords for other services

### Database Protection

1. **Enable SSL for database connections**:
   - In cPanel, go to "MySQL Databases"
   - Check if SSL connections are supported
   - Update your application's `.env` file to enable SSL

2. **Limit Remote Access**:
   - Most Namecheap hosting allows connections only from the same server
   - If remote access is needed, use IP restriction if available

3. **Regular Software Updates**:
   - Keep your PHP and database connector libraries updated
   - Check for security patches regularly

### Data Protection

1. **Sensitive Data Handling**:
   - All passwords are hashed using bcrypt
   - The application implements proper security for tokens and sessions
   - Document file hashes verify integrity

2. **Regular Security Audits**:
   - Monitor database logs for unauthorized access attempts
   - Review user privileges periodically

## Database Schema Installation

### Installing via phpMyAdmin

1. Log in to your cPanel account
2. Open phpMyAdmin from the "Databases" section
3. Select your database from the left sidebar
4. Click the "Import" tab
5. Upload the `database/schema.sql` file from this repository
6. Click "Go" to execute the SQL statements

### Installing via Command Line (if SSH access is available)

```bash
# Connect to your server via SSH
ssh username@your-domain.com

# Navigate to the directory containing your schema file
cd /path/to/al-sader-wal-wared/database

# Import the schema
mysql -u your_db_username -p your_database_name < schema.sql
```

## Backup and Recovery

### Creating Regular Backups

1. **Via cPanel Backup Tool**:
   - Go to "Backup" in cPanel
   - Under "Download a MySQL Database Backup", select your database
   - Click "Generate Backup" to download a SQL file

2. **Automatic Scheduled Backups**:
   - Set up cPanel's "Backup Wizard" for weekly backups
   - Consider setting up a remote backup solution

3. **Manual phpMyAdmin Backup**:
   - Login to phpMyAdmin
   - Select your database
   - Click the "Export" tab
   - Choose "Custom" export method for more options
   - Enable "Add DROP TABLE" for clean restoration
   - Select SQL format and click "Go"

### Database Restoration

1. **Restoring via phpMyAdmin**:
   - Login to phpMyAdmin
   - Select your database
   - Click the "Import" tab
   - Choose your backup file
   - Click "Go"

2. **Restoring via Command Line** (if SSH access is available):
   ```bash
   mysql -u username -p database_name < backup_file.sql
   ```

## Environment Configuration

After setting up your database, you'll need to configure the application to connect to it:

1. Create a copy of `.env.example` named `.env` in the server directory:
   ```bash
   cp server/.env.example server/.env
   ```

2. Edit the `.env` file with your Namecheap MySQL credentials:
   ```
   DB_HOST=localhost
   DB_NAME=alsader_walwared_db
   DB_USER=your_database_username
   DB_PASSWORD=your_database_password
   DB_PORT=3306
   
   # Enable SSL if supported by your hosting
   DB_SSL=false
   ```

3. Generate secure random strings for JWT_SECRET and ENCRYPTION_KEY:
   ```
   JWT_SECRET=generate_a_random_64_character_string_here
   ENCRYPTION_KEY=generate_another_random_32_character_string_here
   ```
   
   You can generate secure random strings using:
   ```php
   <?php
   echo bin2hex(random_bytes(32));
   ?>
   ```

4. Set the correct path for file uploads:
   ```
   UPLOAD_PATH=/home/username/public_html/al-sader-wal-wared/server/uploads
   ```

## Troubleshooting

### Common Database Connection Issues

1. **"Could not connect to the database"**:
   - Verify hostname, username, password, and database name
   - Check if your database user has the correct privileges
   - Ensure your hosting allows connections from your application

2. **"Table does not exist" errors**:
   - Verify the schema was properly imported
   - Check if your database prefix matches what's in the configuration

3. **Permission Issues**:
   - Ensure your database user has the necessary privileges
   - For CREATE/ALTER table issues, ensure your user has these permissions

### Getting Help

If you encounter persistent database issues:

1. Check Namecheap's knowledge base for MySQL-specific articles
2. Contact Namecheap's support for hosting-specific database questions
3. For application-specific issues, refer to our GitHub repository issues section

## Next Steps

After setting up your database:

1. Configure your web server following our [Web Server Setup Guide](./README-SERVER.md)
2. Set up the front-end application following the [Frontend Configuration Guide](./README-FRONTEND.md)
3. Test your installation thoroughly before going live 