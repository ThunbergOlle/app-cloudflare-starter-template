# Important Development Notes

## Database Management
- NEVER remove `.wrangler-persist` directory - it contains the local D1 database data
- Use proper migration commands instead of deleting database files
- Local database state is important for development and testing