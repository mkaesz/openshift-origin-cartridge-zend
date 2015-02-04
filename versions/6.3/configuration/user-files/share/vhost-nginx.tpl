server {

    listen  ${port};
    root    "${docroot}";
    server_name ${vhost};
    index index.php index.html index.htm;
    
    # include the folder containing the vhost aliases for zend server deployment
    include "${aliasdir}/*.conf";
    
    include fastcgi.conf;
}
