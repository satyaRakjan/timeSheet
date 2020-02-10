sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel",
	"sap/m/MessageToast"
], function (Controller, JSONModel, MessageToast) {
	"use strict";

	return Controller.extend("ICS_TimeSheet.ICS_TimeSheet.controller.View1", {
		onInit: function () {
			this.holiday = this.getOwnerComponent().getModel("Holiday").getProperty("/year");
			this.specialDate = [];
			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			oRouter.getRoute("RouteView1").attachPatternMatched(this._onObjectMatched, this);
			this.handleTimeSheet();

		},
		onBeforeRendering: function () {

		},
		onAfterRendering: function () {
			var keys = Object.entries(this.holiday[0]);
			keys.forEach((v) => {
				v[1].forEach((j) => {
					var divDate = v[0] + "" + j.month + "" + j.startDate;
					var fullDate = v[0] + "/" + j.month + "/" + j.startDate;
					this.specialDate.push(fullDate)
					var el = document.querySelector("div[aria-labelledby='" + divDate + "-Descr']");
					if (el != null) {
						el.style.backgroundColor = '#9a9393';
						el.childNodes[2].style.color = 'black';
						if (el.childNodes[4]) {
							el.childNodes[4].remove()
						}
						el.innerHTML += '<span id="holidayText" style="display:initial;text-overflow: ellipsis;overflow: hidden; margin:4px;">' +
							j.title + '</span>';
					}
				})
			})
			this.timeSheetView();
			this.noTimeSheet();

		},

		_onObjectMatched: function (oEvent) {
			this.handleTimeSheet();
			setTimeout(function () {
				this.onAfterRendering();
			}.bind(this), 0);
		},

		timeSheetView: function () {
			var TS = this.getOwnerComponent().getModel("timeSheet").getProperty("/TS");
			var TSEntry = Object.entries(TS);
			var oModel = this.getView().getModel("timeSheet");
			var oModelData = oModel.getProperty("/TS");
			TSEntry.forEach((count) => {
				var checkMonth = (count[1].Month) + 1;
				var getMonth = "";
				var getDate = "";
				var status = [];
				if (checkMonth > 9) {
					getMonth = checkMonth
				} else {
					getMonth = "0" + checkMonth;
				}
				if (count[1].Date < 10) {
					getDate = "0" + count[1].Date;
				} else {
					getDate = count[1].Date
				}
				Object.entries(count[1].Session).forEach((sessions) => {
					if (count[1].Session.length = 2) {
						status.push(sessions[1].status)
					}
				})
				var check = ["Confirmed", "Confirmed"]
				var fullDate = count[1].Year + "" + getMonth + "" + getDate;
				var el = document.querySelector("div[aria-labelledby='" + fullDate + "-Descr']");
				if (el) {
					if (JSON.stringify(status) === JSON.stringify(check)) {
						el.childNodes[2].style.color = 'black';
					} else {
						el.childNodes[2].style.color = 'red';
					}
				}
			})
		},
		handleStartDateChange: function (oEvent) {
			setTimeout(function () {
				this.onAfterRendering();
			}.bind(this), 0);
		},
		noTimeSheet: function () {
			var today = new Date();
			var dayNumber = document.querySelectorAll("div[sap-ui-date]");
			for (var k in dayNumber) {
				var el = dayNumber.item(k)
				var elAt = el.getAttribute("sap-ui-date");
				var elDate = new Date(parseInt(elAt));
				if (today > elDate) {} else {
					el.childNodes[2].style.color = 'black';
				}
			}
		},

		handleTimeSheet: function () {
			var cal = this.byId("SPC1");
			cal.removeAllAppointments()

			var oModel = this.getView().getModel("timeSheet");
			var TS = this.getOwnerComponent().getModel("timeSheet").getProperty("/TS");
			var TSEntry = Object.entries(TS);
			TSEntry.forEach((count) => {
				Object.entries(count[1].Session).forEach((sessions) => {
					cal.addAppointment(new sap.ui.unified.CalendarAppointment({
						startDate: new Date(count[1].Year, count[1].Month, count[1].Date, sessions[1].startDate),
						endDate: new Date(count[1].Year, count[1].Month, count[1].Date, sessions[1].endDate),
						title: sessions[1].ID,
						tooltip: sessions[1].ID,
						type: sap.ui.unified.CalendarDayType.Type08
					}));
				})
			})

		},

		handleCell: function (oEvent) {
			var cal = this.byId("SPC1");
			var date = new Date(oEvent.getParameters().startDate);
			var dateFormat = sap.ui.core.format.DateFormat.getDateInstance({
				pattern: "YYYY/MM/dd"
			});
			var dateFormatted = dateFormat.format(date);
			var result = this.specialDate.includes(dateFormatted);
			if (result == true) {
				var msg = 'this day is NonWorking.';
				MessageToast.show(msg);
			} else {
				var loRouter = sap.ui.core.UIComponent.getRouterFor(this);
				date = String(date);
				loRouter.navTo("RouteView2", {
					getDate: date
				});
			}
		}
	});
});