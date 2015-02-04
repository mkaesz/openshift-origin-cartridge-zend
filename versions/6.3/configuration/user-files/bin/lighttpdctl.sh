#!/bin/bash 
if [ -f $ZCE_PREFIX/bin/shell_functions.rc ];then
    . $ZCE_PREFIX/bin/shell_functions.rc
else
    echo "$ZCE_PREFIX/bin/shell_functions.rc doesn't exist!"
    exit 1;
fi
# check_root_privileges
# we want a different TMPDIR in Lighttpd context, mainly so that the sems for Zend exts won't conflict with the ones created by exts loaded in Apache context, see #0029315
export ZEND_TMPDIR=$ZCE_PREFIX/gui/lighttpd/tmp 
export TMPDIR=$ZCE_PREFIX/gui/lighttpd/tmp

WEB_USER=$(whoami)
WD_UID=`id -u $WEB_USER`
WD_GID=`id -g $WEB_USER`

WD_INI=${ZCE_PREFIX}/etc/watchdog-lighttpd.ini
WATCHDOG="${ZCE_PREFIX}/bin/watchdog -c $WD_INI"
BINARY=lighttpd
NAME="$PRODUCT_NAME GUI [Lighttpd]"


start()
{
    start_php_fcgi
    sleep 1
    launch
}
start_php_fcgi()
{
    # if the $ZCE_PREFIX/gui/lighttpd/tmp/php-fcgi.pid does not contain a valid PID, kill the strays and rm the file before launching
    if ! kill -0 `cat $ZCE_PREFIX/gui/lighttpd/tmp/php-fcgi.pid 2>/dev/null` 2>/dev/null;then
        killall -9  $ZCE_PREFIX/gui/lighttpd/sbin/php 2>/dev/null
        rm $ZCE_PREFIX/gui/lighttpd/tmp/php-fcgi.pid 2>/dev/null
    fi
    $ZCE_PREFIX/gui/lighttpd/bin/spawn-fcgi -s $ZCE_PREFIX/gui/lighttpd/tmp/php-fastcgi.socket -f "$ZCE_PREFIX/gui/lighttpd/sbin/php -c $ZCE_PREFIX/gui/lighttpd/etc/php-fcgi.ini" -u $WD_UID -g $WD_GID -C 5 -P $ZCE_PREFIX/gui/lighttpd/tmp/php-fcgi.pid
    chmod 660 $ZCE_PREFIX/gui/lighttpd/tmp/php-fastcgi.socket
}
kill_php_fcgi()
{
    # if the $ZCE_PREFIX/gui/lighttpd/tmp/php-fcgi.pid does not contain a valid PID, kill the strays and rm the file before launching
    if ! kill -0 `cat $ZCE_PREFIX/gui/lighttpd/tmp/php-fcgi.pid 2>/dev/null` 2>/dev/null;then
        killall -9 $ZCE_PREFIX/gui/lighttpd/sbin/php 2>/dev/null
        rm $ZCE_PREFIX/gui/lighttpd/tmp/php-fastcgi.socket 2>/dev/null
        rm $ZCE_PREFIX/gui/lighttpd/tmp/php-fcgi.pid 2>/dev/null
    else
        kill `cat $ZCE_PREFIX/gui/lighttpd/tmp/php-fcgi.pid 2>/dev/null` 2>/dev/null
    fi

}

stop()
{
    kill_php_fcgi
    _kill
}
status()
{
    $WATCHDOG -i $BINARY
}
case "$1" in
	start)
		start
		sleep 1
                status
		;;
	stop)
		stop
		rm -f ${ZCE_PREFIX}/tmp/lighttpd.{app,wd}
		;;
	restart)
		stop
		rm -f ${ZCE_PREFIX}/tmp/lighttpd.{app,wd}
		sleep 1
		start
		;;
	status)
		status
		;;
	*)
		usage
		exit 1
esac

exit $?
