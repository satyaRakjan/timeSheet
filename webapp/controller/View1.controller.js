sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel",
	"sap/m/MessageToast",
	"sap/ui/core/Fragment"
], function (Controller, JSONModel, MessageToast, Fragment) {
	"use strict";

	return Controller.extend("ICS_TimeSheet.ICS_TimeSheet.controller.View1", {
		onInit: function () {
			this.holiday = this.getOwnerComponent().getModel("Holiday").getProperty("/year");
			this.specialDate = [];
			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			oRouter.getRoute("RouteView1").attachPatternMatched(this._onObjectMatched, this);
			this.handleTimeSheet();

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
			}.bind(this), 100);
		},
		onExit: function () {
			if (this.DetailPopover) {
				this.DetailPopover.destroy();
			}
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
				try {
					var fullDate = count[1].Year + "" + getMonth + "" + getDate;
					var el = document.querySelector("div[aria-labelledby='" + fullDate + "-Descr']");
					if (count[1].Session[0].status == "Confirmed" && count[1].Session[1].status == "Confirmed") {
						el.childNodes[2].style.color = 'black';
					} else if (count[1].Session[0].status == "Leave" && count[1].Session[1].status == "Leave") {
						el.childNodes[2].style.color = 'black';
					} else if (count[1].Session[0].status == "Confirmed" && count[1].Session[1].status == "Leave") {
						el.childNodes[2].style.color = 'black';
					} else if (count[1].Session[0].status == "Leave" && count[1].Session[1].status == "Confirmed") {
						el.childNodes[2].style.color = 'black';
					} else {
						el.childNodes[2].style.color = 'red';
					}
				} catch (err) {

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
			today.setHours(0, 0, 0, 0);

			var dayNumber = document.querySelectorAll("div[sap-ui-date]");
			var weekend = document.getElementsByClassName("sapMSPCMonthDay nonWorkingTimeframe");

			for (var k in dayNumber) {
				var el = dayNumber.item(k)
				var elAt = el.getAttribute("sap-ui-date");
				var elDate = new Date(parseInt(elAt));
				if (today > elDate) {

				} else {
					el.childNodes[2].style.color = 'black';
				}
			}
			for (var i in weekend) {
				var element = weekend.item(i);
				element.childNodes[2].style.color = 'black';
			}
		},

		handleTimeSheet: function () {
			var cal = this.byId("SPC1");
			cal.removeAllAppointments()
			var TS = this.getOwnerComponent().getModel("timeSheet").getProperty("/TS");
			var TSEntry = Object.entries(TS);

			TSEntry.forEach((count) => {
					Object.entries(count[1].Session).forEach((sessions) => {
						try {
							if (sessions[1].status == "Leave") {
								cal.addAppointment(new sap.ui.unified.CalendarAppointment({
									startDate: new Date(count[1].Year, count[1].Month, count[1].Date, sessions[1].startDate),
									endDate: new Date(count[1].Year, count[1].Month, count[1].Date, sessions[1].endDate),
									title: sessions[1].ID + "(" + sessions[1].TypeLeave + ")",
									tooltip: sessions[1].ID,
									type: sap.ui.unified.CalendarDayType.Type02
								}));

							} else {
								cal.addAppointment(new sap.ui.unified.CalendarAppointment({
									startDate: new Date(count[1].Year, count[1].Month, count[1].Date, sessions[1].startDate),
									endDate: new Date(count[1].Year, count[1].Month, count[1].Date, sessions[1].endDate),
									title: sessions[1].ID,
									tooltip: sessions[1].ID,
									type: sap.ui.unified.CalendarDayType.Type18
								}));

							}

						} catch (err) {

						}

					})
				})
				// console.log(cal)
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
				MessageToast.show("this day is NonWorking.");
			} else {
				var loRouter = sap.ui.core.UIComponent.getRouterFor(this);
				date = String(date);
				loRouter.navTo("RouteView2", {
					getDate: date
				});
			}
		},
		handleAppointmentSelect: function (oEvent) {
			try {
				var oAppointment = oEvent.getParameter("appointment"),
					oStartDate = oAppointment.getStartDate(),
					oEndDate = oAppointment.getEndDate(),
					oSession = oAppointment.getTooltip(),
					bAllDate,
					oTitle = "",
					TS = this.getOwnerComponent().getModel("timeSheet").getProperty("/TS"),
					oViewModel;
				if (oAppointment === undefined) {
					return;
				}
				var oDateFormat = sap.ui.core.format.DateFormat.getDateInstance({
					pattern: " d MMM yyyy"
				});
				var dateFormatted = oDateFormat.format(oStartDate);
				var selFullDate = String(oStartDate.getFullYear() + "" + oStartDate.getMonth() + "" + oStartDate.getDate());
				var foundTS = TS.find(element => element.ID == selFullDate);
				var foundSession = foundTS.Session.find(element => element.ID == oSession);
				if (oAppointment.getTitle().length > 2) {
					oTitle = "Leave";
					console.log(foundSession.status)
					oViewModel = new JSONModel({
						title: oTitle,
						endDate: oEndDate.toTimeString().split(" ")[0],
						startDate: oStartDate.toTimeString().split(" ")[0],
						TypeLeave: foundSession.TypeLeave,
						Date: dateFormatted,
						Data: foundTS,
						Session: foundSession
					});
				} else {
					oTitle = oAppointment.getTitle();
					console.log(foundSession.status)
					oViewModel = new JSONModel({
						title: oTitle,
						endDate: oEndDate.toTimeString().split(" ")[0],
						startDate: oStartDate.toTimeString().split(" ")[0],
						Date: dateFormatted,
						Data: foundTS,
						Session: foundSession
					});
				}
				this.Sesson = oTitle;
				this.Date = String(new Date(dateFormatted));
				this.getView().setModel(oViewModel, "view");
				if (!oAppointment.getSelected()) {
					this.DetailPopover.close();
					return;
				}

				if (!this.DetailPopover) {
					Fragment.load({
							id: "Detail",
							name: "ICS_TimeSheet.ICS_TimeSheet.view.Detail",
							controller: this
						})
						.then(function (oPopoverContent) {
							this.DetailPopover = oPopoverContent;
							// this.DetailPopover.setBindingContext(oAppointment.getBindingContext());
							this.getView().addDependent(this.DetailPopover);
							this.DetailPopover.openBy(oAppointment);
						}.bind(this));
				} else {
					this.DetailPopover.openBy(oAppointment);
				}

			} catch (err) {

			}

			// console.log(oAppointment)
			// var oButton = oEvent.getSource();
			// if (!this.DetailPopover) {
			// 	Fragment.load({
			// 		id: "Detail",
			// 		name: "ICS_TimeSheet.ICS_TimeSheet.view.Detail",
			// 		controller: this
			// 	}).then(function (oPopover) {
			// 		this.DetailPopover = oPopover;
			// 		this.getView().addDependent(this.DetailPopover);
			// 		this.DetailPopover.
			// 			(oButton);
			// 	}.bind(this));
			// } else {
			// 	this.DetailPopover.openBy(oButton);
			// }

		},
		onEdit: function () {
			if (this.Sesson == "Leave") {
				MessageToast.show("Leave can't");

			} else {
				var getSession = "";

				if (this.Sesson == "AM") {
					getSession = "Morning";
				} else if (this.Sesson == "PM") {
					getSession = "Afternoon";
				}
				var loRouter = sap.ui.core.UIComponent.getRouterFor(this);
				this.onClose();

				loRouter.navTo("RouteView3", {
					session: getSession,
					date: this.Date
				});
			}
		},
		onClose: function () {
			// var oData = {
			// 	selectedDates: []
			// };
			// this.oModel.setData(oData);
			this.DetailPopover.close();
		},
	});
});