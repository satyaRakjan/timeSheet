sap.ui.define([
	'sap/ui/core/mvc/Controller',
	'sap/ui/core/routing/History',
	'sap/ui/model/json/JSONModel',
	'sap/m/MessageToast'
], function (Controller, History, JSONModel, MessageToast) {
	"use strict";

	return Controller.extend("ICS_TimeSheet.ICS_TimeSheet.controller.View3", {
		onInit: function (oevent) {

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
			var checkDate = selectDate.getFullYear() + "" + selectDate.getMonth() + "" + selectDate.getDate();
			var TS = this.getOwnerComponent().getModel("timeSheet").getProperty("/TS");
			var TSEntry = Object.entries(TS);
			TSEntry.forEach((count) => {
				Object.entries(count[1].Session).forEach((sessions) => {
					var fullDate = count[1].Year + "" + count[1].Month + "" + count[1].Date;
					if (checkDate == fullDate && sessions[1].ID == getSession) {
						status = sessions[1].status;
					}
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
				ID:getSession,
				startDate: startDate,
				endDate: endDate,
				status: status
			};
			var oModelData = oModel.getProperty("/TS");
			// var index = oModelData.findIndex(s => s.ID == fullDate)
			var index = oModelData.findIndex(s => s.ID == fullDate)
			if (index >= 0) {
				var msg = 'success.';
				var getOModel = oModel.getProperty("/TS/" + index + "/Session");
				try {
					var sessionKey = getOModel.findIndex(s => s.ID == getSession)
					oModel.setProperty("/TS/" + index + "/Session/"+sessionKey,TSdata);
					oModel.updateBindings();
					MessageToast.show(msg);
				} catch (err) {
					console.log("error")
				}
				if (getOModel != "undefined") {
				} else {
					var newSession = "";
					if (getSession == "AM") {
						newSession = {
							"AM": TSdata
						}
					} else if (getSession == "PM") {
						newSession = {
							"PM": TSdata
						}
					}
					var addNewSessions = oModel.getProperty("/TS/" + index + "/Session");
					// addNewSessions.push(newSession);
					// oModel.setProperty("/TS/" + index + "/Session", addNewSessions);
					console.log(getOModel)
					MessageToast.show(msg);
					// oModel.updateBindings()

					// console.log(oModel.getProperty("/TS/" + index + "/Session/0/"))
				}

				// oModel.setProperty("/TS/"+index+"/");

			} else {
				// oModelData.push();
				// var newObject = {
				// 	"ID": ,
				// 	"Year":,
				// 	"Month":,
				// 	"Date":,
				// 	"Session":

				// }
				// console.log(oModelData)
			}

			// } else {
			// 	var oModelData = oModel.getProperty("/TS/0/Year");
			// 	oModelData.push(2022);
			// 	console.log(oModelData)
			// 	oModel.updateBindings();

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