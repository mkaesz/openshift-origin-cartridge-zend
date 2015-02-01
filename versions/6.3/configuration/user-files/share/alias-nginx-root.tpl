location / {
    try_files $uri $uri/ /index.php?$args;
    root "${path}/";
    include fastcgi.conf;	
}

