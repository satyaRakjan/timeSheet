sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel",
	"sap/m/MessageToast"
], function (Controller, JSONModel, MessageToast) {
	"use strict";

	return Controller.extend("ICS_TimeSheet.ICS_TimeSheet.controller.View1", {
		onInit: function () {
			this.weeknum = document.getElementsByClassName("sapMSPCMonthWeekNumber");
			this.nonWorking = document.getElementsByClassName('sapMSPCMonthDay nonWorkingTimeframe');
			this.holiday = this.getOwnerComponent().getModel("Holiday").getProperty("/year");
			this.TS = this.getOwnerComponent().getModel("timeSheet").getProperty("/TS");
			this.specialDate = [];
			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			oRouter.getRoute("RouteView1").attachPatternMatched(this._onObjectMatched, this);
			this.handleHoliday();
		},

		onAfterRendering: function () {
			this.weekview();
			this.timeSheetView();
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
						el.innerHTML += '<span id="holidayText" style="display:initial;text-overflow: ellipsis;overflow: hidden; margin:4px;">' +
							j.title + '</span>';
					}
				})
			})

		},

		_onObjectMatched: function (oEvent) {
			this.weekview();
			this.handleHoliday();
		},

		timeSheetView: function () {
			this.TS = this.getOwnerComponent().getModel("timeSheet").getProperty("/TS");
			var TSkeys = Object.entries(this.TS[0]);
			TSkeys.forEach((year) => {
				Object.entries(year[1]).forEach((months) => {
					Object.entries(months[1]).forEach((month) => {
						var checkMonth = parseInt(month[0]) + 1;
						var getMonth = "";
						if (checkMonth > 9) {
							getMonth = checkMonth
						} else {
							getMonth = "0" + checkMonth;
						}
						Object.entries(month[1]).forEach((days) => {
							Object.entries(days[1]).forEach((day) => {
								Object.entries(day[1]).forEach((sessions) => {
									Object.entries(sessions[1]).forEach((session) => {
										var fullDate = year[0] + getMonth + day[0];
										var el = document.querySelector("div[aria-labelledby='" + fullDate + "-Descr']");
										if (el) {
											var conditions = ["AM", "PM"];
											var hasAll = conditions.every(prop => sessions[1].hasOwnProperty(prop));
											if(hasAll == true){
												el.childNodes[2].style.color = 'black';
											}
										}
									})
								});
							});
						});
					});
				});
			})
		},

		weekview: function () {
			for (var i in this.weeknum) {
				this.weeknum.item(i).remove();
			}
			for (var j in this.nonWorking) {
				this.nonWorking.item(j).style.backgroundColor = "#9a9393";
			}
			this.noTimeSheet();
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
				if (today < elDate) {} else {
					el.childNodes[2].style.color = 'red';
				}
			}
		},

		handleHoliday: function () {
			var cal = this.byId("SPC1");
			var TSkeys = Object.entries(this.TS[0]);
			cal.removeAllAppointments
			TSkeys.forEach((year) => {
				Object.entries(year[1]).forEach((months) => {
					Object.entries(months[1]).forEach((month) => {
						Object.entries(month[1]).forEach((days) => {
							Object.entries(days[1]).forEach((day) => {
								Object.entries(day[1]).forEach((sessions) => {
									Object.entries(sessions[1]).forEach((session) => {
										cal.addAppointment(new sap.ui.unified.CalendarAppointment({
											startDate: new Date(year[0], month[0], day[0], session[1][0].startDate),
											endDate: new Date(year[0], month[0], day[0], session[1][0].endDate),
											title: session[0],
											tooltip: session[0],
											type: sap.ui.unified.CalendarDayType.Type08
										}));
									})
								});
							});
						});
					});
				});
			})
		},

		handleCell: function (oEvent) {
			var date = new Date(oEvent.getParameters().startDate);
			var dateFormat = sap.ui.core.format.DateFormat.getDateInstance({
				pattern: "YYYY/MM/dd"
			});
			var dateFormatted = dateFormat.format(date);
			console.log(dateFormatted)
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