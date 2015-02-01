INSERT INTO ZSD_MONITOR_RULE_TYPES VALUES('function-error','Function Error');
INSERT INTO ZSD_MONITOR_RULES VALUES(NULL, 'function-error', -1, -1, 'Function Error', 1, 'Triggered when one of the watched functions returns FALSE', NULL, 0);
INSERT INTO ZSD_MONITOR_RULE_CONDITIONS VALUES(NULL, 1, 0, 'string-in-list', 'function-name', 'curl_exec|fopen|file_get_contents|file_put_contents|fsockopen|ftp_connect|ftp_ssl_connect|ldap_connect|pcntl_exec|socket_connect|stream_socket_client');
INSERT INTO ZSD_MONITOR_RULE_TRIGGERS VALUES(NULL, 1, 0); 

INSERT INTO ZSD_MONITOR_RULES VALUES(NULL, 'function-error', -1, -1, 'Database Error', 1, 'Triggered when one of the watched database functions returns FALSE', NULL, 0);
INSERT INTO ZSD_MONITOR_RULE_CONDITIONS VALUES(NULL, 2, 0, 'string-in-list',  'function-name', 'mssql_connect|mssql_execute|mssql_query|mssql_unbuffered_query|mysql_connect|mysql_db_query|mysql_query|mysql_unbuffered_query|mysqli_connect|mysqli_execute|mysqli_master_query|mysqli_multi_query|mysqli_query|mysqli_real_connect|mysqli_real_query|mysqli_rpl_query_type|mysqli_send_query|mysqli_slave_query|mysqli_stmt_execute|oci_connect|ociexecute|oci_execute|ocilogon|oci_new_connect|odbc_connect|odbc_exec|odbc_execute|ora_exec|PDO::exec|PDO::prepare|PDO::query|pg_connect|pg_exec|pg_query|pg_send_query|sqlite_array_query|sqlite_exec|sqlite_query|sqlite_single_query|sqlite_unbuffered_query|db2_connect|db2_exec|db2_execute|db2_prepare|SQLite3::exec|SQLite3::query|SQLite3::querySingle|SQLite3Stmt::execute|Mongo*');
INSERT INTO ZSD_MONITOR_RULE_TRIGGERS VALUES(NULL, 2, 1); 

INSERT INTO ZSD_MONITOR_RULE_TYPES VALUES('function-slow-exec','Slow Function Execution');
INSERT INTO ZSD_MONITOR_RULES VALUES(NULL, 'function-slow-exec', -1, -1, 'Slow Function Execution', 1, 'Triggered when one of the watched functions runs longer than the specified duration', NULL, 0);
INSERT INTO ZSD_MONITOR_RULE_CONDITIONS VALUES(NULL, 3, 0, 'string-in-list', 'function-name','curl_exec|curl_multi_exec|dom_xpath_query|exec|fopen|file_get_contents|file_put_contents|fsockopen|ftp_connect|ftp_ssl_connect|ldap_connect|pcntl_exec|shell_exec|socket_connect|stream_socket_client|SoapClient::__call|SoapClient::__soapCall');
INSERT INTO ZSD_MONITOR_RULE_TRIGGERS VALUES(NULL, 3, 1); 
INSERT INTO ZSD_MONITOR_RULE_TRIGGERS VALUES(NULL, 3, 0); 
INSERT INTO ZSD_MONITOR_RULE_CONDITIONS VALUES(NULL, 0, 3, 'number-greater-than','exec-time','2000');
INSERT INTO ZSD_MONITOR_RULE_CONDITIONS VALUES(NULL, 0, 4, 'number-greater-than','exec-time','1000');

INSERT INTO ZSD_MONITOR_RULES VALUES(NULL, 'function-slow-exec', -1, -1, 'Slow Query Execution', 1, 'Triggered when one of the watched database functions runs longer than the specified duration', NULL, 0);
INSERT INTO ZSD_MONITOR_RULE_CONDITIONS VALUES(NULL, 4, 0, 'string-in-list', 'function-name','mssql_execute|mssql_query|mssql_unbuffered_query|mysql_db_query|mysql_query|mysql_unbuffered_query|mysqli_execute|mysqli_master_query|mysqli_multi_query|mysqli_query|mysqli_real_connect|mysqli_real_query|mysqli_send_query|mysqli_slave_query|mysqli_stmt_execute|ociexecute|oci_execute|odbc_exec|odbc_execute|ora_exec|PDO::exec|PDO::query|PDOStatement::fetchAll|pg_exec|pg_query|pg_send_query|sqlite_array_query|sqlite_exec|sqlite_query|sqlite_single_query|sqlite_unbuffered_query|db2_exec|db2_execute|SQLite3::exec|SQLite3::query|SQLite3::querySingle|SQLite3Stmt::execute|Mongo*');
INSERT INTO ZSD_MONITOR_RULE_TRIGGERS VALUES(NULL, 4, 1); 
INSERT INTO ZSD_MONITOR_RULE_TRIGGERS VALUES(NULL, 4, 0); 
INSERT INTO ZSD_MONITOR_RULE_CONDITIONS VALUES(NULL, 0, 5, 'number-greater-than','exec-time','2000');
INSERT INTO ZSD_MONITOR_RULE_CONDITIONS VALUES(NULL, 0, 6, 'number-greater-than','exec-time','1000');

INSERT INTO ZSD_MONITOR_RULE_TYPES VALUES('request-slow-exec','Slow Request Execution');
INSERT INTO ZSD_MONITOR_RULES VALUES(NULL, 'request-slow-exec', -1, -1, 'Slow Request Execution', 1, 'Triggered when a PHP request''s runtime is longer than the specified duration', NULL, 0);
INSERT INTO ZSD_MONITOR_RULE_TRIGGERS VALUES(NULL, 5, 1); 
INSERT INTO ZSD_MONITOR_RULE_TRIGGERS VALUES(NULL, 5, 0); 
INSERT INTO ZSD_MONITOR_RULE_TRIGGERS VALUES(NULL, 5, -1);
INSERT INTO ZSD_MONITOR_RULE_CONDITIONS VALUES(NULL, 0, 7, 'number-greater-than','exec-time','5000');
INSERT INTO ZSD_MONITOR_RULE_CONDITIONS VALUES(NULL, 0, 7, 'number-greater-than','exec-time-percent-change','60');
INSERT INTO ZSD_MONITOR_RULE_CONDITIONS VALUES(NULL, 0, 8, 'number-greater-than','exec-time','2000');
INSERT INTO ZSD_MONITOR_RULE_CONDITIONS VALUES(NULL, 0, 8, 'number-greater-than','exec-time-percent-change','30');
INSERT INTO ZSD_MONITOR_RULE_CONDITIONS VALUES(NULL, 0, 9, 'number-greater-than','exec-time-percent-change','15');

INSERT INTO ZSD_MONITOR_RULE_TYPES VALUES('request-large-mem-usage','High Memory Usage');
INSERT INTO ZSD_MONITOR_RULES VALUES(NULL, 'request-large-mem-usage', -1, -1, 'High Memory Usage', 1, 'Triggered when a PHP request consumes more than the specified amount of memory', NULL, 0);
INSERT INTO ZSD_MONITOR_RULE_TRIGGERS VALUES(NULL, 6, 1); 
INSERT INTO ZSD_MONITOR_RULE_TRIGGERS VALUES(NULL, 6, 0); 
INSERT INTO ZSD_MONITOR_RULE_TRIGGERS VALUES(NULL, 6, -1); 
INSERT INTO ZSD_MONITOR_RULE_CONDITIONS VALUES(NULL, 0, 10, 'number-greater-than','mem-usage','16384');
INSERT INTO ZSD_MONITOR_RULE_CONDITIONS VALUES(NULL, 0, 10, 'number-greater-than','mem-usage-percent-change','60');
INSERT INTO ZSD_MONITOR_RULE_CONDITIONS VALUES(NULL, 0, 11, 'number-greater-than','mem-usage','8192');
INSERT INTO ZSD_MONITOR_RULE_CONDITIONS VALUES(NULL, 0, 11, 'number-greater-than','mem-usage-percent-change','30');
INSERT INTO ZSD_MONITOR_RULE_CONDITIONS VALUES(NULL, 0, 12, 'number-greater-than','mem-usage-percent-change','15');

INSERT INTO ZSD_MONITOR_RULE_TYPES VALUES('request-relative-large-out-size','Inconsistent Output Size');
INSERT INTO ZSD_MONITOR_RULES VALUES(NULL, 'request-relative-large-out-size', -1, -1, 'Inconsistent Output Size', 1, 'Triggered when a PHP request''s output size deviates from the average by the percentage specified (measured per URL)', NULL, 0);
INSERT INTO ZSD_MONITOR_RULE_TRIGGERS VALUES(NULL, 7, 1);
INSERT INTO ZSD_MONITOR_RULE_TRIGGERS VALUES(NULL, 7, 0);
INSERT INTO ZSD_MONITOR_RULE_CONDITIONS VALUES(NULL, 0, 13, 'number-greater-than','out-size-percent-change','200');
INSERT INTO ZSD_MONITOR_RULE_CONDITIONS VALUES(NULL, 0, 14, 'number-greater-than','out-size-percent-change','50');

INSERT INTO ZSD_MONITOR_RULE_TYPES VALUES('zend-error','PHP Error');
INSERT INTO ZSD_MONITOR_RULES VALUES(NULL, 'zend-error', -1, -1, 'PHP Error', 1, 'Triggered when a PHP error of one of the selected error levels is reported', NULL, 0);
INSERT INTO ZSD_MONITOR_RULE_TRIGGERS VALUES(NULL, 8, 1); 
INSERT INTO ZSD_MONITOR_RULE_TRIGGERS VALUES(NULL, 8, 0); 
INSERT INTO ZSD_MONITOR_RULE_CONDITIONS VALUES(NULL, 0, 15, 'bitwise-and','error-type','85');
INSERT INTO ZSD_MONITOR_RULE_CONDITIONS VALUES(NULL, 0, 16, 'bitwise-and','error-type','6050');

INSERT INTO ZSD_MONITOR_RULE_TYPES VALUES('java-exception','Uncaught Java Exception');
INSERT INTO ZSD_MONITOR_RULES VALUES(NULL, 'java-exception', -1, -1, 'Uncaught Java Exception', 1, 'Triggered when Java code called through the Java Bridge failed due to an uncaught exception', NULL, 0);
INSERT INTO ZSD_MONITOR_RULE_TRIGGERS VALUES(NULL, 9, 1); 

INSERT INTO ZSD_MONITOR_RULE_TYPES VALUES('custom','Custom Event');
INSERT INTO ZSD_MONITOR_RULES VALUES(NULL, 'custom', -1, -1, 'Custom Event', 1, 'Triggered when the API function ''zend_monitor_custom_event'' is called from inside PHP code', NULL, 0);
INSERT INTO ZSD_MONITOR_RULE_TRIGGERS VALUES(NULL, 10, 0);

INSERT INTO ZSD_MONITOR_RULES VALUES(NULL, 'custom', -1, -1, 'Zend Framework Exception', 1, 'Triggered when Zend Framework Exception thrown', NULL, 0);
INSERT INTO ZSD_MONITOR_RULE_TRIGGERS VALUES(NULL, 11, 0);

INSERT INTO ZSD_MONITOR_RULE_TYPES VALUES('jq-job-exec-error','Job Execution Error');
INSERT INTO ZSD_MONITOR_RULES VALUES(NULL, 'jq-job-exec-error', -1, -1, 'Job Execution Error', 1, 'Triggered when the system is unable to run a queued or scheduled job', NULL, 0);
INSERT INTO ZSD_MONITOR_RULE_TRIGGERS VALUES(NULL, 12, 1); 

INSERT INTO ZSD_MONITOR_RULE_TYPES VALUES('jq-job-logical-failure','Job Logical Failure');
INSERT INTO ZSD_MONITOR_RULES VALUES(NULL, 'jq-job-logical-failure', -1, -1, 'Job Logical Failure', 1, 'Triggered when a job is reported as "failed" using the ZendJobQueue::setCurrentJobStatus() method', NULL, 0);
INSERT INTO ZSD_MONITOR_RULE_TRIGGERS VALUES(NULL, 13, 1); 

INSERT INTO ZSD_MONITOR_RULE_TYPES VALUES('jq-job-exec-delay','Job Execution Delay');
INSERT INTO ZSD_MONITOR_RULES VALUES(NULL, 'jq-job-exec-delay', -1, -1, 'Job Execution Delay', 1, 'Triggered when a job starts in delay', NULL, 0);
INSERT INTO ZSD_MONITOR_RULE_TRIGGERS VALUES(NULL, 14, 0); 

INSERT INTO ZSD_MONITOR_RULE_TYPES VALUES('tracer-write-file-fail','Failed Writing Code Tracing Data');
INSERT INTO ZSD_MONITOR_RULES VALUES(NULL, 'tracer-write-file-fail', -1, -1, 'Failed Writing Code Tracing Data', 1, 'Triggered when Code Tracing fails to write trace data to disk', NULL, 0);
INSERT INTO ZSD_MONITOR_RULE_TRIGGERS VALUES(NULL, 15, 1); 
