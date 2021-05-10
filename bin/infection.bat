@ECHO OFF
setlocal DISABLEDELAYEDEXPANSION
SET BIN_TARGET=%~dp0/../vendor/infection/infection/bin/infection
php "%BIN_TARGET%" %*
