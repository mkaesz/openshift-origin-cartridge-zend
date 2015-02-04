# Created by Zend Server

server {

    listen  ${port};
    root    "${docroot}";
    server_name ${vhost};
    index index.php index.html index.htm;
    
    ssl on;
    ssl_certificate "${certificate_file}";
    ssl_certificate_key "${certificate_key_file}";

    # include the folder containing the vhost aliases for zend server deployment
    include "${aliasdir}/*.conf";
    
    include fastcgi.conf;
}

