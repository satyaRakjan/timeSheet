/* global QUnit */
QUnit.config.autostart = false;

sap.ui.getCore().attachInit(function () {
	"use strict";

	sap.ui.require([
		"ICS_TimeSheet/ICS_TimeSheet/test/unit/AllTests"
	], function () {
		QUnit.start();
	});
});