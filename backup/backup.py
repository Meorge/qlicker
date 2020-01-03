"""
Qlicker Auto Backup
Malcolm Anderson
2 January 2020

This Python script will automatically back up the Qlicker database files
to the directory specified in backupPath, at the interval specified in minutesPerBackup.
If deleteOldBackups is True, any backups older than the first backupsToKeep backups will be deleted.

"""

global timeOfLastBackup, minutesPerBackup, backupPath, backupsToKeep, formatString, secretKeysExists

import subprocess
import time, os, shutil, traceback, sys
import smtplib, ssl


secretKeysExists = os.path.exists(os.getcwd() + "/secret_keys.py")
if secretKeysExists:
    """
    The "secret_keys.py" file needs to have a dictionary variable called smtp.
    This must have the following keys:
        username - effectively the email address you want to send from (emailAddress@email.com)
        password - the password used by the email account (hunter2)
        server   - the server's URL (smtp.email.com)
        port     - the port used by the server (465)
    """
    from secret_keys import smtp
else:
    print("NOTE: secret_keys.py does not exist, so error emails cannot be sent!")




# Timestamp of last backup
timeOfLastBackup = 0

# Number of minutes to wait between backups
minutesPerBackup = 60

# name of backup folder
backupPath = os.getcwd() + "/../../backup"

# set to False to never delete backups
deleteOldBackups = True

# number of backups to keep
backupsToKeep = 10

# format string for backups
formatString = "%Y-%m-%dT%H%M%S"

# IP address of server
serverIP = "127.0.0.1"

# port of server
serverPort = "8081"

# email to send errors to
destinationEmail = "m.anderson39@students.clark.edu"




# Creates the string used for naming backup folders
def makeTimeString():
    lt = time.localtime(time.time())
    return time.strftime(formatString, lt)

# Runs the command to make a backup, and sends an error email
# if the return code is not zero.
def makeBackup():
    print(f"BACKUP: {makeTimeString()}")
    processOutput = subprocess.run(["mongodump", "-h", serverIP, "--port", serverPort, "-d", "meteor", "-o", backupPath + "/" + makeTimeString()], capture_output=True)
    print(f"Error code: {processOutput.returncode} Output: {processOutput.stderr}")
    if processOutput.returncode != 0:
        sendMongoErrorEmail(processOutput)

# Deletes any backups that are older than the first backupsToKeep backups.
# (If deleteOldBackups is False, this won't happen.)
def deleteOldestBackup():
    if deleteOldBackups is False: return

    dirList = os.listdir(backupPath)

    # The variable backups is a list of directory names for each backup.
    backups = []
    for n in dirList:
        if not os.path.isfile(backupPath + "/" + n):
            backups.append(n)

    print(f"{len(backups)} backups currently saved")

    # The variable backupDates is a list of date objects that each backup is from.
    backupDates = []
    for n in backups:
        timeVal = time.strptime(n, formatString)
        backupDates.append(timeVal)

    # Let's determine how many extra backups there are that we need to delete...
    numberOfBackupsToDelete = len(backups) - backupsToKeep

    # If numberOfBackupsToDelete is greater than 0, we've got deleting to do!
    if numberOfBackupsToDelete > 0:
        backupDatesSorted = sorted(backupDates)
        print("---")
        deleteLeft = numberOfBackupsToDelete
        for b in backupDatesSorted:
            print(f"{'DELETE' if deleteLeft > 0 else '  KEEP'} - {time.asctime(b)}")
            if deleteLeft > 0:
                shutil.rmtree(backupPath + "/" + time.strftime(formatString, b))
            deleteLeft -= 1
        print("---")


# Used for sending emails regarding an error in the database backup process.
def sendMongoErrorEmail(errors):
    decoded_stdout = errors.stdout.decode("unicode_escape")
    decoded_stderr = errors.stderr.decode("unicode_escape")

    errorMessage = f"""An error has occurred while trying to make a backup of the Qlicker database at {time.asctime()}.
Error code: {errors.returncode}
-----------------------------
Contents of stdout:
{decoded_stdout}
-----------------------------
Contents of stderr:
{decoded_stderr}
"""
    sendEmail(errorMessage)


# Used for sending emails regarding an error in this Python script.
def sendPythonErrorEmail(tb):
    msg = f"""An error has occurred in the Qlicker backup script. The script has been stopped to prevent continued errors.

{tb}
"""
    sendEmail(msg)

# Generic function to send emails
def sendEmail(strToSend):
    if not secretKeysExists:
        print("Cannot send email as secret_keys.py does not exist!")
        return


    context = ssl.create_default_context()

    with smtplib.SMTP_SSL(smtp["server"], smtp["port"], context=context) as server:
        server.login(smtp["username"], smtp["password"])

        errorMessage = strToSend

        server.sendmail(smtp["username"], destinationEmail, f'From: {smtp["username"]}\nTo: {destinationEmail}\nSubject: Backup Error Encountered\n' + errorMessage)    


# determine if backup folder exists - if not, create it
if not os.path.exists(backupPath):
    print(f"Backup path {backupPath} does not exist, so creating it")
    os.mkdir(backupPath)


print("\nQlicker Backup System")
print("Malcolm Anderson")
print("January 2020")
print("----------------------")
print("Current backup settings:")
print(f"Destination:\t\t\t{backupPath}")
print(f"Server:\t\t\t\t{serverIP}:{serverPort}")
print(f"Minutes between backups:\t{minutesPerBackup} minutes")
print(f"Format for backup folders:\t{formatString}")
print(f"Error emails:\t\t\t{f'Send to {destinationEmail}' if secretKeysExists else 'Not configured'}")
print(f"Keep backups:\t\t\t{f'{backupsToKeep} most recent' if deleteOldBackups else 'All'}")
print("----------------------")
print("\n\n\n")
sys.exit()

# Run forever (until manually stopped or a Python error is hit)
while True:
    try:
        currentTime = int(time.time())

        # Get the number of minutes that have passed since last backup
        minutesSinceLastBackup = float(currentTime - timeOfLastBackup) / 60
        if minutesSinceLastBackup > minutesPerBackup:
            # Do a backup
            makeBackup()
            timeOfLastBackup = int(time.time())
            deleteOldestBackup()
            time.sleep(5)
        else:
            # Sleep for 5 seconds
            time.sleep(5)

    except Exception as e:
        # If an error occurs, send an email about it and then exit
        tb = traceback.format_exc()
        print("Error encountered!!")
        print(tb)
        sendPythonErrorEmail(tb)
        sys.exit()
        

    