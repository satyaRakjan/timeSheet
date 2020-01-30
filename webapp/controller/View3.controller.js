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
			var TSkeys = Object.entries(this.TS[0]);
			TSkeys.forEach((year) => {
				Object.entries(year[1]).forEach((months) => {
					Object.entries(months[1]).forEach((month) => {
						Object.entries(month[1]).forEach((days) => {
							Object.entries(days[1]).forEach((day) => {
								Object.entries(day[1]).forEach((sessions) => {
									Object.entries(sessions[1]).forEach((session) => {
										var fullDate = year[0] + month[0] + day[0];
										if (checkDate == fullDate && session[0] == getSession) {
											Object.entries(session[1]).forEach((obj) => {
												status = obj[1].status;
											})
										}
									})
								});
							});
						});
					});
				});
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
		submitTS: function (oEvent) {
			console.log(this.TS)
			// var date = new Date(this.date);
			// var startDate = "";
			// var endDate = "";
			// var title = "";
			// if (this.session == "Morning") {
			// 	startDate = new Date(date.setHours(9));
			// 	endDate = new Date(date.setHours(12));
			// 	title = "AM";

			// } else {
			// 	startDate = new Date(date.setHours(13));
			// 	endDate = new Date(date.setHours(18));
			// 	title = "PM";

			// }
			// var year = date.getFullYear();
			// var month = "";
			// var day = date.getDate();
			// if (date.getMonth() > 9) {
			// 	month = date.getMonth();
			// } else {
			// 	month = "0" + date.getMonth();
			// }
			// this.TS = this.getOwnerComponent().getModel("timeSheet").getProperty("/TS/0/" + year + "/0/" + month + "/0/"+day);
			// // var TSkeys = Object.entries(this.TS);
			// console.log(this.TS);
			// var oModel = this.getView().getModel("timeSheet");

			// var TSdata = {};

			// TSdata = {
			// 	"startDate": startDate,
			// 	"endDate": endDate
			// };
			// var addTS = oModel.getProperty("/TS");
			// addTS.push(TSdata);
			// oModel.setProperty("/TS/0/" + year + "/0/" + month + "/0/",addTS);
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