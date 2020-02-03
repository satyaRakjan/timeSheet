sap.ui.define([
	'sap/ui/core/mvc/Controller',
	'sap/ui/core/routing/History',
	'sap/ui/model/json/JSONModel',
	'sap/m/MessageToast'
], function (Controller, History, JSONModel,MessageToast) {
	"use strict";

	return Controller.extend("ICS_TimeSheet.ICS_TimeSheet.controller.View3", {
		onInit: function (oevent) {

			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			oRouter.getRoute("RouteView3").attachPatternMatched(this._onObjectMatched, this);
		},

		_onObjectMatched: function (oEvent) {
			this.TS = this.getOwnerComponent().getModel("timeSheet").getProperty("/TS");
			this.date = oEvent.getParameter("arguments").date;
			this.session = oEvent.getParameter("arguments").session;
			this.heandleTimeSheet();
		},
		heandleTimeSheet: function () {
			var getSession = "";
			var status = "";
			if (this.session == "Morning") {
				getSession = "AM";
			} else if (this.session == "Afternoon") {
				getSession = "PM";
			}
			var selectDate = new Date(this.date);
			var checkDate = selectDate.getFullYear() + "" + selectDate.getMonth() + "" + selectDate.getDate();
			var TSkeys = Object.entries(this.TS);
			TSkeys.forEach((ts) => {
				Object.entries(ts[1]["Year"][0]).forEach((year) => {
					Object.entries(year[1][0]["Month"][0]).forEach((month) => {
						Object.entries(month[1][0]["Date"][0]).forEach((date) => {
							Object.entries(date[1][0]).forEach((session) => {
								var fullDate = year[0] + month[0] + date[0];
								if (checkDate == fullDate && session[0] == getSession) {
									status = session[1][0].status;
								}

							})
						})
					})
				})
			})

			var oDateFormat = sap.ui.core.format.DateFormat.getDateInstance({
				pattern: " d MMM yyyy"
			});
			var dateFormatted = oDateFormat.format(selectDate);
			var oViewModel = new JSONModel({
				session: this.session,
				date: dateFormatted,
				status: status
			});
			this.getView().setModel(oViewModel, "view");
		},
		heandleSession: function (oEvent) {
			var getSelect = oEvent.getParameters().selectedItem.getText();
			this.session = oEvent.getParameters().selectedItem.getText();
			this.heandleTimeSheet();

		},
		ClearTS: function () {
			var TS = this.getOwnerComponent().getModel("timeSheet").getProperty("/TS");
			console.log(TS)
		},
		submitTS: function (oEvent) {
			var date = new Date(this.date);
			var getYear = date.getFullYear();
			var getMonth = date.getMonth();
			var getDate = date.getDate();
			var oModel = this.getView().getModel("timeSheet");
			var oSelect = this.byId("sessions").getSelectedKey();
			var getSession = "";
			var startDate = "";
			var endDate = "";
			var status = this.byId("status").getSelectedKey();
			console.log(status)
			if (oSelect == "Morning") {
				getSession = "AM";
				startDate = "9";
				endDate = "12";
			} else if (oSelect == "Afternoon") {
				getSession = "PM";
				startDate = "13";
				endDate = "18";
			}
			var TSdata = {
				startDate: startDate,
				endDate: endDate,
				status: status
			};
			var oEmployees = oModel.getProperty("/TS/0/Year/0/" + getYear + "/0/Month/0/" + getMonth + "/0/Date/0/" + getDate + "/0/" +
				getSession + "/0/");
			if (oEmployees) {
				console.log(oEmployees)
				oModel.setProperty("/TS/0/Year/0/" + getYear + "/0/Month/0/" + getMonth + "/0/Date/0/" + getDate + "/0/" + getSession + "/0",
					TSdata);
				oModel.updateBindings();
				var msg = 'success.';
				MessageToast.show(msg);
			} else {
				console.log("null")
			}
		},

		onNavBack: function () {
			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			oRouter.navTo("RouteView2", {
				getDate: this.date
			});

		}
	});
});