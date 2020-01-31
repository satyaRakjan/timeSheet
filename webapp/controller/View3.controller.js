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
			console.log(this.TS)
		},
		submitTS: function (oEvent) {
			var date = new Date(this.date);
			var getYear = date.getFullYear();
			var getMonth = date.getMonth();
			var getDate = date.getDate();
			var oModel = this.getView().getModel("timeSheet");
			var T = this.TS = this.getOwnerComponent().getModel("timeSheet").getProperty("/TS/0/");
			
			
			var oModel = this.getView().getModel("timeSheet");
			debugger
			// var TSdata = {};
			var TSdata = {
				Year:"2021"
			};
			var oModelData = oModel.getProperty("/TS/0/");
			oModelData.push(TSdata);
			oModel.setProperty("/TS/0/", oModelData);
			// var addTS = oModel.getProperty("/TS/0/");
			// addTS.push(TSdata);
			// oModel.setProperty("/TS/0/", addTS);
			

			// oModel.setProperty("/TS/0/" + year + "/0/" + month + "/0/",addTS);

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