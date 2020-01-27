sap.ui.define([
	'sap/ui/core/mvc/Controller',
	'sap/ui/core/routing/History',
	'sap/ui/model/json/JSONModel',
	'sap/m/MessageToast'

], function (Controller, History, JSONModel, MessageToast) {
	"use strict";

	return Controller.extend("ICS_TimeSheet.ICS_TimeSheet.controller.View2", {
		onInit: function () {
			this.holiday = this.getOwnerComponent().getModel("Holiday").getProperty("/year");
			this.AMIcon = this.byId("AMIcon");
			this.PMIcon = this.byId("PMIcon");
			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			oRouter.getRoute("RouteView2").attachPatternMatched(this._onObjectMatched, this);

		},
		onAfterRendering: function () {
			var keys = Object.entries(this.holiday[0]);
			var oCalendar = this.byId("calendar");
			this.specialDate = [];
			keys.forEach((v) => {
				v[1].forEach((j) => {
					var fullDate = j.month + "/" + j.startDate + "/" + v[0];
					this.specialDate.push(fullDate);
					oCalendar.addSpecialDate(new sap.ui.unified.DateTypeRange({
						startDate: new Date(fullDate),
						endDate: new Date(fullDate),
						type: sap.ui.unified.CalendarDayType.NonWorking,
						tooltip: j.title
					}));
				})
			})
		},
		_onObjectMatched: function (oEvent) {
			var date = oEvent.getParameter("arguments").getDate;
			var selectDate = new Date(date);
			var cal = this.byId("calendar");
			cal.setStartDate(selectDate);
			cal.removeAllSelectedDates();
			cal.addSelectedDate(new sap.ui.unified.DateRange({
				startDate: selectDate
			}));
			this.TS = this.getOwnerComponent().getModel("timeSheet").getProperty("/TS");
			this.timeSheetSelect(selectDate);
		},

		timeSheetSelect: function (selectDate) {

			var oDateFormat = sap.ui.core.format.DateFormat.getDateInstance({
				pattern: " d MMM yyyy"
			});
			var dateFormatted = oDateFormat.format(selectDate);
			var oViewModel = new JSONModel({
				selectDate: dateFormatted
			});

			this.byId("sessionList").setMode("None");
			this.AMIcon.setSrc("");
			this.PMIcon.setSrc("");
			this.byId("container-ICS_TimeSheet---View2--AM-selectMulti").setSelected(false);
			this.byId("container-ICS_TimeSheet---View2--PM-selectMulti").setSelected(false);
			this.byId("container-ICS_TimeSheet---View2--PM-selectMulti").setEnabled(false);
			this.byId("container-ICS_TimeSheet---View2--AM-selectMulti").setEnabled(false);

			this.getView().setModel(oViewModel, "view");
			var TSkeys = Object.entries(this.TS[0]);
			TSkeys.forEach((year) => {
				Object.entries(year[1]).forEach((months) => {
					Object.entries(months[1]).forEach((month) => {
						Object.entries(month[1]).forEach((days) => {
							Object.entries(days[1]).forEach((day) => {
								Object.entries(day[1]).forEach((sessions) => {
									Object.entries(sessions[1]).forEach((session) => {
										var fullDate = new Date(year[0], month[0], day[0]);
										if (String(fullDate) == String(selectDate)) {
											this.list = this.byId(session[0] + "Icon");
											this.list.setSrc("sap-icon://notes")
											this.byId("container-ICS_TimeSheet---View2--" + session[0] + "-selectMulti").setEnabled(true)
											this.byId("sessionList").setMode("MultiSelect");
										}
									})
								});
							});
						});
					});
				});
			})

		},

		handleCalendarSelect: function (oEvent) {
			var oCalendar = oEvent.getSource(),
				oSelectedDate = oCalendar.getSelectedDates()[0],
				selectDate = oSelectedDate.getStartDate(),
				dateFormat = sap.ui.core.format.DateFormat.getDateInstance({
					pattern: "MM/dd/YYYY"
				}),
				dateFormatted = dateFormat.format(selectDate),
				result = this.specialDate.includes(dateFormatted);
			if (result == true) {
				var msg = 'this day is NonWorking.';
				MessageToast.show(msg);

			} else {
				this.timeSheetSelect(selectDate);
			}
		},

		onNavBack: function () {

			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			oRouter.navTo("RouteView1", false);

		},
		AMPress: function (oEvent) {
			var cal = this.byId("calendar");
			var date = String(cal.getSelectedDates()[0].getStartDate());
			var loRouter = sap.ui.core.UIComponent.getRouterFor(this);
			loRouter.navTo("RouteView3", {
				session: "Morning",
				date: date

			});
		},
		PMPress: function (oEvent) {
			var cal = this.byId("calendar");
			var date = String(cal.getSelectedDates()[0].getStartDate());
			var loRouter = sap.ui.core.UIComponent.getRouterFor(this);
			loRouter.navTo("RouteView3", {
				session: "Afternoon",
				date: date

			});
		},

		onSelectionChange: function (oEvent) {
			var selected = oEvent.getParameter("selected");
			var cal = this.byId("calendar");
			var oSelectedDate = cal.getSelectedDates()[0];
			var	selectDate = oSelectedDate.getStartDate();

			var TSkeys = Object.entries(this.TS[0]);
			if (selected == true) {
				TSkeys.forEach((year) => {
					Object.entries(year[1]).forEach((months) => {
						Object.entries(months[1]).forEach((month) => {
							Object.entries(month[1]).forEach((days) => {
								Object.entries(days[1]).forEach((day) => {
									Object.entries(day[1]).forEach((sessions) => {
										Object.entries(sessions[1]).forEach((session) => {
											var fullDate = new Date(year[0], month[0], day[0]);
											if (String(fullDate) == String(selectDate)) {
												this.byId("container-ICS_TimeSheet---View2--" + session[0] + "-selectMulti").setSelected(true);
											}
										})
									});
								});
							});
						});
					});
				})
			} else {
				this.byId("container-ICS_TimeSheet---View2--AM-selectMulti").setSelected(false);
				this.byId("container-ICS_TimeSheet---View2--PM-selectMulti").setSelected(false);

			}
		},

		onSelectionSession: function (oEvent) {
			if (this.AM.getSelected() == false && this.PM.getSelected() == false) {
				this.copyBtn.setEnabled(false)
				this.delBtn.setEnabled(false)
			} else {
				this.copyBtn.setEnabled(true)
				this.delBtn.setEnabled(true)

			}

		},

		copyTo: function (oEvent) {
			// console.log(this.AM.getSelected())
			// this.AM.setEnabled(false)
		}
	});
});