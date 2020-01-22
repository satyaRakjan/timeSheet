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
			this.holiday = this.getOwnerComponent().getModel("Holiday").getProperty("/holidays");
			this.specialDate = [];
			for (var day in this.holiday) {
				this.specialDate.push(this.holiday[day].month + "/" + this.holiday[day].startDate);
			}
			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			oRouter.getRoute("RouteView1").attachPatternMatched(this._onObjectMatched, this);
			this.handleHoliday();
		},

		onAfterRendering: function () {
			var elmnt = document.getElementsByClassName("sapMSPCMonthDay");
			this.weekview();
			for (var num in elmnt) {
				var divDate = elmnt.item(num).getAttribute('aria-labelledby');
				for (var day in this.holiday) {
					if (this.holiday[day].date.includes(divDate.slice(4))) {
						var el = document.querySelector("div[aria-labelledby='" + divDate + "']");
						el.style.backgroundColor = '#9a9393';
						el.innerHTML += '<span id="holidayText" style="display:initial;text-overflow: ellipsis;overflow: hidden; margin:5px;">' + this.holiday[
								day].title +
							'</span>';
					}
				}
			}
		},

		_onObjectMatched: function (oEvent) {
			this.weekview();
			this.handleHoliday();

		},

		weekview: function () {
			for (var i in this.weeknum) {
				this.weeknum.item(i).remove();
			}
			for (var j in this.nonWorking) {
				this.nonWorking.item(j).style.backgroundColor = "#9a9393";
			}
		},

		handleStartDateChange: function (oEvent) {
			setTimeout(function () {
				this.onAfterRendering();
			}.bind(this), 0);

		},

		handleViewChange: function () {
			// MessageToast.show("'viewChange' event fired.");
		},

		handleHoliday: function () {
			var TS = this.getOwnerComponent().getModel("JSON").getProperty("/TS");
			var TS2 = this.getOwnerComponent().getModel("JSON").getProperty("/TS");

			var cal = this.byId("SPC1");
			cal.removeAllAppointments();
			for (var count in TS) {
				cal.addAppointment(new sap.ui.unified.CalendarAppointment({
					startDate: new Date(TS[count].startDate),
					endDate: new Date(TS[count].endDate),
					title: TS[count].title,
					tooltip: TS[count].title,
					type: sap.ui.unified.CalendarDayType.Type08
				}));

			}

		},

		handleCell: function (oEvent) {
			var date = String(oEvent.getParameters().startDate);
			var fullDate = new Date(date).getMonth() + "/" + new Date(date).getDate();
			var result = this.specialDate.includes(fullDate);
			if (result == true) {
				var msg = 'this day is NonWorking.';
				MessageToast.show(msg);

			} else {
				var loRouter = sap.ui.core.UIComponent.getRouterFor(this);
				loRouter.navTo("RouteView2", {
					getDate: date
				});
			}
		}
	});
});