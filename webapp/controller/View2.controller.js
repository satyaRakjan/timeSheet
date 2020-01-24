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

			var oDateFormat = sap.ui.core.format.DateFormat.getDateInstance({
				pattern: " d MMM yyyy"
			});

			var dateFormatted = oDateFormat.format(selectDate);
			var oViewModel = new JSONModel({
				selectDate: dateFormatted
			});
			this.getView().setModel(oViewModel, "view");
			this.copyBtn = this.byId("copyBtn");
			this.delBtn = this.byId("delBtn");
			this.AMIcon.setSrc("")
			this.PMIcon.setSrc("")

			this.TS = this.getOwnerComponent().getModel("timeSheet").getProperty("/TS");
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
											this.handleTS();
										}
									})
								});
							});
						});
					});
				});
			})

		},
		handleTS: function () {

		},

		handleCalendarSelect: function (oEvent) {
			var oCalendar = oEvent.getSource(),
				oSelectedDate = oCalendar.getSelectedDates()[0],
				oStartDate = oSelectedDate.getStartDate(),
				dateFormat = sap.ui.core.format.DateFormat.getDateInstance({
					pattern: "MM/dd/YYYY"
				}),
				dateFormatted = dateFormat.format(oStartDate),
				result = this.specialDate.includes(dateFormatted);
			if (result == true) {
				var msg = 'this day is NonWorking.';
				MessageToast.show(msg);

			} else {
				var array2 = this.arr,
					dateID = Date.parse(oStartDate),
					// resultTS = array2.includes(dateID),
					// getDate = new Date(resultTS),
					even = (element) => element.ID === dateID,
					check = array2.some(even);

				var result2 = array2.find(ts => ts.ID === dateID);
				var AM = "",
					PM = "",
					AMIcon = this.getView().byId("AMIcon"),
					PMIcon = this.getView().byId("PMIcon"),
					AMenable = this.byId("container-ICS_TimeSheet---View2--AM-selectMulti"),
					PMenable = this.byId("container-ICS_TimeSheet---View2--PM-selectMulti"),
					sessionList = this.byId("sessionList");
				if (check == true) {
					var resultTS = array2.filter(ts => ts.ID === dateID);
					var getDate = new Date(resultTS[0].ID);
					getDate.setHours(resultTS[0].AM)
					AM = true;
					PM = true;
					AMIcon.setSrc("sap-icon://notes")
					PMIcon.setSrc("sap-icon://notes")
					AMenable.setEnabled(true)
					PMenable.setEnabled(true)
					sessionList.setMode("MultiSelect")
				} else {
					AM = false;
					PM = false;
					AMIcon.setSrc("")
					PMIcon.setSrc("")
					AMenable.setEnabled(false)
					PMenable.setEnabled(false)
					sessionList.setMode("None")

				}

				var oDateFormat = sap.ui.core.format.DateFormat.getDateInstance({
					pattern: " d MMM yyyy"
				});

				var dateFormatted = oDateFormat.format(oStartDate);
				var oViewModel = new JSONModel({
					selectDate: dateFormatted,
					AM: AM,
					PM: PM
				});
				this.getView().setModel(oViewModel, "view");
				// this._holiday(oStartDate);
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
			// console.log(selectedItem);
			// console.log(selected);
			if (selected == true) {

				this.AM.setSelected(true)
				this.PM.setSelected(true)
				this.copyBtn.setEnabled(true)
				this.delBtn.setEnabled(true)

			} else {
				this.AM.setSelected(false)
				this.PM.setSelected(false)
				this.copyBtn.setEnabled(false)
				this.delBtn.setEnabled(false)

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