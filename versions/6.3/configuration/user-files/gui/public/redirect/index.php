<?php
$redirectUrl = '/ZendServer';

if (! headers_sent()) {
        header('Location: ' . $redirectUrl);
}
?>
<html>
<head>
<meta http-equiv="Refresh" content="0; URL=<?php echo $redirectUrl; ?>">
<script type="text/javascript">
window.location.href = "<?php echo $redirectUrl; ?>";
</script>
</head>
<body>
You are being redirected to the Zend Server Administration interface
Click <a href="<?php echo $redirectUrl; ?>">here</a> if you were not automatically redirected.
</body>
</html>
