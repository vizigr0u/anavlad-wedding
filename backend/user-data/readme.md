# Private User Data Directory

This directory contains data only logged in users should see.

1. **photos** directory: Contains photos that only logged-in users should see, e.g. your wedding photos.

2. **static** directory: Contains `translation_private.json` which includes translations that only logged-in users should see, e.g. types of events, description of the event, the dress code, etc.

3. **weddingdata.json** file: Contains data about the wedding, such as time date and place of the event(s) and payment information where guest can send money.
See weddingdata.default.json in the parent directory.

4. **database** directory: This is where the backend will store its SQLite database files and a schema version file. If this directory does not exist, the backend will create it and the required files.
