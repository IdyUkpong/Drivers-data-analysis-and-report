const { getTrips, getDriver, getVehicle } = require("api");
/**
 * This function should return the data for drivers in the specified format
 *
 * Question 4
 *
 * @returns {any} Driver report data
 */

async function driverReport() {
  // Your code goes here

  const convertToNumber = (string) => {
    let newString = string.replace(",", "");
    return Number(newString);
  };

  const getBilledTotal = (array) => {
    let billedTotal = array
      .map((element) => {
        if (typeof element.billedAmount === "string") {
          return convertToNumber(element.billedAmount);
        } else {
          return element.billedAmount;
        }
      })
      .reduce((a, b) => a + b, 0)
      .toFixed(2);

    return billedTotal;
  };

  const theDriversReportList = [];
  let fullName;
  let id;
  let phone;
  let noOfTrips;
  let noOfVehicles;
  let vehicles;
  let noOfCashTrips;
  let noOfNonCashTrips;
  let totalAmountEarned;
  let totalCashAmount;
  let totalNonCashAmount;
  let tripsArr = [];

  const trips = await getTrips();

  const driverIdFromTripsArr = trips.map((trip) => trip.driverID);
  const uniqueDriverIds = [];
  const setOfDrivers = new Set(driverIdFromTripsArr);
  setOfDrivers.forEach((element) => {
    uniqueDriverIds.push(element);
  });

  const lengthOfDriverIdsArr = uniqueDriverIds.length;
  let driverObj;
  let driverNoOfTrips = [];
  let vehicleReport;
  let vehicleDetailsArr;
  let theDriverIscashOrNotIscahTrips = [];
  let theDriverIscashTrue;
  let theDriverIscashFalse;
  let isCashFalseBills;
  let theDriverTrips = [];
  let userOfTheDriverTrips = [];

  async function driverInfoGenerator(count) {
    if (count === lengthOfDriverIdsArr) {
      return;
    }

    try {
      driverObj = await getDriver(uniqueDriverIds[count]);
      fullName = driverObj.name;
    } catch (err) {
      console.log(err);
    }

    id = uniqueDriverIds[count];

    phone = driverObj.phone;

    driverNoOfTrips = trips.filter(
      (trip) => trip.driverID === uniqueDriverIds[count]
    );
    noOfTrips = driverNoOfTrips.length;

    noOfVehicles = driverObj.vehicleID.length;

    try {
      vehicleReport = await Promise.all(
        driverObj.vehicleID.map(async (id) => {
          vehicleDetailsArr = await getVehicle(id);
          return await {
            plate: vehicleDetailsArr.plate,
            manufacturer: vehicleDetailsArr.manufacturer,
          };
        })
      );
    } catch (err) {
      console.log(err);
    }

    
    vehicles = vehicleReport;

    theDriverIscashOrNotIscahTrips = trips.filter(
      (trip) => trip.driverID === uniqueDriverIds[count]
    );

    theDriverIscashTrue = theDriverIscashOrNotIscahTrips.filter(
      (trip) => trip.isCash === true
    );

    isCashTrueBills = theDriverIscashTrue.map((trip) => trip.billedAmount);
    noOfCashTrips = theDriverIscashTrue.length;

    theDriverIscashFalse = theDriverIscashOrNotIscahTrips.filter(
      (trip) => trip.isCash === false
    );

    isCashFalseBills = theDriverIscashFalse.map((trip) => trip.billedAmount);
    noOfNonCashTrips = theDriverIscashFalse.length;

    totalAmountEarned = getBilledTotal(theDriverIscashOrNotIscahTrips);

    totalCashAmount = getBilledTotal(theDriverIscashTrue);

    totalNonCashAmount = getBilledTotal(theDriverIscashFalse);

    theDriverTrips = trips.filter(
      (trip) => trip.driverID === uniqueDriverIds[count]
    );
    theDriverTrips.forEach((users) => {
      userOfTheDriverTrips.push({
        user: users.user.name,
        created: users.created,
        pickup: users.pickup.address,
        destination: users.destination.address,
        billed: users.billedAmount,
        isCash: users.isCash,
      });
    });
    tripsArr = userOfTheDriverTrips;
    userOfTheDriverTrips = [];

    theDriversReportList.push({
      fullName: fullName,
      id: id,
      phone: phone,
      noOfTrips: noOfTrips,
      noOfVehicles: noOfVehicles,
      vehicles: vehicles,
      noOfCashTrips: noOfCashTrips,
      noOfNonCashTrips: noOfNonCashTrips,
      totalAmountEarned: parseInt(totalAmountEarned),
      totalCashAmount: parseInt(totalCashAmount),
      totalNonCashAmount: parseInt(totalNonCashAmount),
      trips: tripsArr,
    });
    await driverInfoGenerator(count + 1);
  }
  await driverInfoGenerator(0);

  return theDriversReportList;
}
driverReport();

module.exports = driverReport;
