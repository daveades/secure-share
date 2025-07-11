# SECURE SHARE
Secure share is a file sharing platform that enables gives you granlated permission on The file to be shared.

## Features
1. Secure file sharing with a temporary link for download.
2. Ability to set expiry time for files.
3. Protect shared files with passwords.
4. Realtime dashboard analysis for file download statistics.

## To implement
1. Encrypting Uploaded files for addded security
2. Better UI and file state management.
3. Ability to recover deleted files within a specified time from deletion time.
4. Better dashboard UI and proper handling of file states (Expired, Deleted)

## Known Issues 
1. The user email shows up in the navbar after login.
2. When a download manager takes over download
    1. Error: download failed when it did not actually fail.
    2. Download count increases irrationaly.
3. When Download actually fails
    1. Irrational increase of the download count.
4. Ability to refresh login token (Route already included).
5. Create a separate tab for deleted / expired files rather than a toggle to include them in main file list


## Motivation
I decided to embark on the project beacuse I saw it as a project that was going to strengthen my skills in many importatnt areas of Software Engineering.

# START
1. Install docker
2. install docker compose
3. Set environment variables
4. `docker compose up --build` from root directory.