    Alias ${alias} "${path}"
# This is needed to work-around configuration problem in SLES
    <Directory "${path}">
        AllowOverride All
        Options +Indexes +FollowSymLinks
        DirectoryIndex index.php
        Order allow,deny
        Allow from all
        Require all granted
    </Directory>
