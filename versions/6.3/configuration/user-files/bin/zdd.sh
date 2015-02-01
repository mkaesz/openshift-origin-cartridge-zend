#!/bin/bash 
NAME="Deployment"

ZEND_TMPDIR=${ZCE_PREFIX}/tmp

if [ -f $ZCE_PREFIX/bin/shell_functions.rc ];then
    . $ZCE_PREFIX/bin/shell_functions.rc
else
    echo "$ZCE_PREFIX/bin/shell_functions.rc doesn't exist!"
    exit 1;
fi
#check_root_privileges

. ${ZCE_PREFIX}/bin/shell_functions.rc

WEB_USER=$(whoami)

WD_UID=`id -u $WEB_USER`
WD_GID=`id -u $WEB_USER`

WD_INI=${ZCE_PREFIX}/etc/watchdog-deployment.ini
WATCHDOG="${ZCE_PREFIX}/bin/watchdog -c $WD_INI"
BINARY=zdd

TMPDIR=${ZCE_PREFIX}/tmp
export ZEND_TMPDIR=${ZCE_PREFIX}/tmp

start()
{
    launch
}

stop()
{
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
		;;
	restart)
		stop
		sleep 1
		start
		;;
	status)
                status
		;;
	*)
		usage
esac

exit $?
