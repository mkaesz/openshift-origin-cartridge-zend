# Created by Zend Server

<VirtualHost *:${port}>

    DocumentRoot "${docroot}"
    <Directory "${docroot}">
        Options +Indexes +FollowSymLinks
        DirectoryIndex index.php
        Order allow,deny
        Allow from all
        AllowOverride All
    </Directory>

    SSLEngine on
    SSLCertificateFile "${certificate_file}"
    SSLCertificateKeyFile "${certificate_key_file}"
    SSLCertificateChainFile "${certificate_chain_file}"

    ServerName ${vhost}:${port}
    
    # include the folder containing the vhost aliases for zend server deployment
    Include "${aliasdir}/*.conf"
    
</VirtualHost>
