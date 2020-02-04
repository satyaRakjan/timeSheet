sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel",
	"sap/m/MessageToast"
], function (Controller, JSONModel, MessageToast) {
	"use strict";

	return Controller.extend("ICS_TimeSheet.ICS_TimeSheet.controller.View1", {
		onInit: function () {
			this.holiday = this.getOwnerComponent().getModel("Holiday").getProperty("/year");
			// this.TS = this.getOwnerComponent().getModel("timeSheet").getProperty("/TS");
			this.TS = this.getOwnerComponent().getModel("timeSheet").getProperty("/TS");
			this.specialDate = [];
			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			oRouter.getRoute("RouteView1").attachPatternMatched(this._onObjectMatched, this);
			this.handleTimeSheet();
		},

		onAfterRendering: function () {

			var keys = Object.entries(this.holiday[0]);
			// var innerText = document.querySelectorAll("#holidayText");
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
			this.noTimeSheet();
			this.timeSheetView();

		},

		_onObjectMatched: function (oEvent) {
			setTimeout(function () {
				this.onAfterRendering();
			}.bind(this), 0);
		},

		timeSheetView: function () {
			var TS = this.getOwnerComponent().getModel("timeSheet").getProperty("/TS");
			var TSkeys = Object.entries(TS);
			TSkeys.forEach((ts) => {
				Object.entries(ts[1]["Year"][0]).forEach((year) => {
					Object.entries(year[1][0]["Month"][0]).forEach((month) => {
						var checkMonth = parseInt(month[0]) + 1;
						var getMonth = "";
						if (checkMonth > 9) {
							getMonth = checkMonth
						} else {
							getMonth = "0" + checkMonth;
						}
						Object.entries(month[1][0]["Date"][0]).forEach((date) => {
							Object.entries(date[1][0]).forEach((session) => {

								var fullDate = year[0] + getMonth + date[0];
								var el = document.querySelector("div[aria-labelledby='" + fullDate + "-Descr']");
								if (el) {
									var conditions = ["AM", "PM"];
									var hasAll = conditions.every(prop => date[1][0].hasOwnProperty(prop));

									// var hasConfirm = conditions.every(prop => date[1][0].hasOwnProperty(prop));
									if (hasAll == true) {
										if (date[1][0].AM[0].status == "Confirmed" && date[1][0].PM[0].status == "Confirmed") {
											el.childNodes[2].style.color = 'black';
										} else {
											el.childNodes[2].style.color = 'red';
										}
									} else {
										el.childNodes[2].style.color = 'red';
									}
								}
							})
						})
					})
				})
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
			cal.removeAllAppointments
			var TSkeys = Object.entries(this.TS);
			var oModel = this.getView().getModel("timeSheet");
			TSkeys.forEach((ts) => {
				Object.entries(ts[1]["Year"][0]).forEach((year) => {
					Object.entries(year[1][0]["Month"][0]).forEach((month) => {
						Object.entries(month[1][0]["Date"][0]).forEach((date) => {
							Object.entries(date[1][0]).forEach((session) => {
								cal.addAppointment(new sap.ui.unified.CalendarAppointment({
									startDate: new Date(year[0], month[0], date[0], session[1][0].startDate),
									endDate: new Date(year[0], month[0], date[0], session[1][0].endDate),
									title: session[0],
									tooltip: session[0],
									type: sap.ui.unified.CalendarDayType.Type08
								}));
							})
						})
					})
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