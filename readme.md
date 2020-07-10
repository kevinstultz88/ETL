# Compile and Run

#### Steps
* run `npm install`
* run `npm run watch`
* Then press debug in VSCode debug menu.

# ETL

## Goals
  * Automatically upload ETL.
  * Should fail if data changes to unknown format.
  * Needs to handle multiple carriers.

## Steps
  * Carrier ETL
    * Get newest xlsx file from S3 bucket
    * Update record date if needed
    * Logic to know if we have already processed file?
  * JSON
    * Convert from xlsx to json
  * Materialzied Calculations
    * Based on carrier map fields and their values to a Generic Structure
    * Do a lot of checking to validate data.
      * Has all fields we expect.
      * All fields have sane values.
      * Check for any new fields.
    * Throws error if data is invalid.
  * Generic JSON
    * Convert to generic JSON structure
  * Production Data
    * Save generic JSON to DB
    * Truncate and add into staging table for reverting.
    * Append to production table.
    * Safe guards to not insert same data multiple times.

## Architecture
  * Scheduling
    * Run once per day/night.
  * Hosting Options
    * Circle CI (Docker Container)
      * Pros
        * Simple job execution at specific time.
    * Server (EC2, Kubernetes)
      * Pros
        * Easier to debug
      * Cons
        * More costly

# Email Reports

## Goals
  * Table for the different reports
    * Should define what sql routine
    * Email of the user
    * How often to send the report

## Steps
  * Trigger on schedule.
  * Call SQL function.
  * Map to Excel like format.
  * Send email with attached report.

## Architecture
  * Same as ETL