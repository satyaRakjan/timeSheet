sap.ui.define([
	'sap/ui/core/mvc/Controller',
	'sap/ui/core/routing/History',
	'sap/ui/model/json/JSONModel',
	'sap/m/MessageToast'
], function (Controller, History, JSONModel, MessageToast) {
	"use strict";

	return Controller.extend("ICS_TimeSheet.ICS_TimeSheet.controller.View3", {
		onInit: function () {
			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			oRouter.getRoute("RouteView3").attachPatternMatched(this._onObjectMatched, this);
		},

		_onObjectMatched: function (oEvent) {
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
			var selFullDate = selectDate.getFullYear() + "" + selectDate.getMonth() + "" + selectDate.getDate();
			var TS = this.getOwnerComponent().getModel("timeSheet").getProperty("/TS");
			var foundTS = TS.find(element => element.ID == selFullDate);
			if (foundTS) {
				Object.entries(foundTS.Session).forEach((obj) => {
					if (obj[1].ID == getSession) {
						status = obj[1].status;
					}
				})
			}
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
			var date = new Date(this.date);
			var checkDate = date.getFullYear() + "" + date.getMonth() + "" + date.getDate();
			var TS = this.getOwnerComponent().getModel("timeSheet").getProperty("/TS");
			var foundTS = TS.find(element => element.ID == checkDate);
			if (foundTS) {
				Object.entries(foundTS.Session).forEach((obj) => {
					if (obj[1].status == "Leave") {
						this.session = this.session;
						MessageToast.show("leave");

					}
				})
			} else {
				this.session = oEvent.getParameters().selectedItem.getText();
			}

			this.heandleTimeSheet();

		},
		ClearTS: function () {
			var TS = this.getOwnerComponent().getModel("timeSheet").getProperty("/TS");
		},

		addTimeSheet: function () {
			var date = new Date(this.date);
			var getYear = date.getFullYear();
			var getMonth = date.getMonth();
			var getDate = date.getDate();
			var fullDate = getYear + "" + getMonth + "" + getDate;
			var oModel = this.getView().getModel("timeSheet");
			var oSelect = this.byId("sessions").getSelectedKey();
			var getSession = "";
			var startDate = "";
			var endDate = "";
			var status = this.byId("status").getSelectedKey();
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
				ID: getSession,
				startDate: startDate,
				endDate: endDate,
				status: status
			};
			var oModelData = oModel.getProperty("/TS");
			var index = oModelData.findIndex(s => s.ID == fullDate);
			var msg = 'success.';
			if (index >= 0) {
				var getOModel = oModel.getProperty("/TS/" + index + "/Session");
				var sessionKey = getOModel.findIndex(s => s.ID == getSession)
				if (sessionKey >= 0) {
					oModel.setProperty("/TS/" + index + "/Session/" + sessionKey, TSdata);
					oModel.updateBindings();
					MessageToast.show(msg);
				} else {
					console.log(false)
				}
			} else {
				var addObj = [];
				if (getSession == "AM") {
					addObj.push(TSdata, {
						ID: "PM"
					})

				} else if (getSession == "PM") {
					addObj.push({
						ID: "AM"
					}, TSdata)

				}
				var newObject = {
					"ID": fullDate,
					"Year": getYear,
					"Month": getMonth,
					"Date": getDate,
					"Session": addObj
				}
				oModelData.push(newObject);
				oModel.setProperty("/TS", oModelData);
				oModel.updateBindings()
				MessageToast.show(msg);
			}
		},
		submitTS: function (oEvent) {
			var date = new Date(this.date);
			var getMonth = date.getMonth();

			var currentDate = new Date();
			currentDate.setHours(0, 0, 0, 0);
			var checkDate = currentDate.getDate();
			// currentDate.setDate(5);
			if (checkDate >= 5) {
				if (getMonth >= currentDate.getMonth()) {
					this.addTimeSheet();
				} else {
					MessageToast.show("Time out to Time stamp");
				}

			} else {
				this.addTimeSheet();
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