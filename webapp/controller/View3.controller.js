sap.ui.define([
	'sap/ui/core/mvc/Controller',
	'sap/ui/core/routing/History',
	'sap/ui/model/json/JSONModel'
], function (Controller, History, JSONModel) {
	"use strict";

	return Controller.extend("ICS_TimeSheet.ICS_TimeSheet.controller.View3", {
		onInit: function (oevent) {
			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			oRouter.getRoute("RouteView3").attachPatternMatched(this._onObjectMatched, this);
		},

		_onObjectMatched: function (oEvent) {
			var date = oEvent.getParameter("arguments").date;
			var session = oEvent.getParameter("arguments").session;

			this.date = date;
			this.session = session;
			var selectDate = new Date(date);
			var oDateFormat = sap.ui.core.format.DateFormat.getDateInstance({
				pattern: " d MMM yyyy"
			});

			var dateFormatted = oDateFormat.format(selectDate);

			var oViewModel = new JSONModel({
				session: this.session,
				date: dateFormatted
			});
			this.getView().setModel(oViewModel, "view");

			// this.getView().bindElement({
			// 	path: "/" + oEvent.getParameter("arguments").getDate,
			// 	model: "invoice"
			// });
			// var selectDate = new Date(date);
			// var cal = this.byId("calendar");
			// cal.setStartDate(selectDate);
			// cal.removeAllSelectedDates();
			// cal.addSelectedDate(new sap.ui.unified.DateRange({
			// 	startDate: selectDate
			// }));

			// var oDateFormat = sap.ui.core.format.DateFormat.getDateInstance({
			// 	pattern: " d MMM yyyy"
			// });

			// var dateFormatted = oDateFormat.format(selectDate);
			// var oViewModel = new JSONModel({
			// 	selectDate: dateFormatted
			// });
			// this.getView().setModel(oViewModel, "view");

		},

		submitTS: function (oEvent) {
			var date = new Date(this.date);
			var startDate = "";
			var endDate = "";
			var title = "";
			if (this.session == "Morning") {
				startDate = new Date(date.setHours(9));
				endDate = new Date(date.setHours(12));
				title = "AM";

			} else {
				startDate = new Date(date.setHours(13));
				endDate = new Date(date.setHours(18));
				title = "PM";

			}
			var year = date.getFullYear();
			var month = "";
			var day = date.getDate();
			if (date.getMonth() > 9) {
				month = date.getMonth();
			} else {
				month = "0" + date.getMonth();
			}
			console.log(day)
			// this.TS = this.getOwnerComponent().getModel("timeSheet").getProperty("/TS/0/" + year + "/0/" + month + "/0/"+day);
			// // var TSkeys = Object.entries(this.TS);
			// console.log(this.TS);
			var oModel = this.getView().getModel("timeSheet");
			
			var TSdata = {};

			TSdata = {
				"startDate": startDate,
				"endDate": endDate
			};
			var addTS = oModel.getProperty("/TS");
			addTS.push(TSdata);
			oModel.setProperty("/TS/0/" + year + "/0/" + month + "/0/",addTS);
			console.log(addTS)
			// var oHistory = History.getInstance();
			// var sPreviousHash = oHistory.getPreviousHash();

			// if (sPreviousHash !== undefined) {
			// 	window.history.go(-1);
			// } else {
			// 	var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			// 	oRouter.navTo("RouteView2", false);
			// }

		},

		onNavBack: function () {

			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			oRouter.navTo("RouteView2", {
				getDate: this.date
			});

		}
	});
});