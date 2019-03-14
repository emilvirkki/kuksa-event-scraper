// TODO Add exports
// TODO Add test script that lists and pulls a couple of events
// TODO Add readme
// TODO publish on npm
// TODO add ability to filter events by dates

const puppeteer = require('puppeteer');
const moment = require('moment');

const parseDateTime = (dateTimeStr) => {
  if (dateTimeStr.indexOf('klo') > -1) {
    return moment(dateTimeStr, 'DD.MM.YYYY [klo] HH:mm').toDate();
  } else {
    return moment(dateTimeStr, 'DD.MM.YYYY').hour(12).minute(0).second(0).toDate();
  }
};

const getEvents = async (filters) => {
  if (filters.organizer && !Number.isInteger(+filters.organizer)) {
    throw new Error('Organizer ID must be an integer');
  }

  let browser, links;
  try {
    browser = await puppeteer.launch();
    const page = await browser.newPage();

    await page.goto('https://kuksa.partio.fi/Kotisivut/tilaisuudet.aspx');
    await page.select('#dpJarjestajaId', filters.organizer);
    await page.click('#btnHae');
    await page.waitForNavigation();
    links = await page.$$eval('.varilinkki', links => links.map(a => a.href));
  } catch (e) {
    throw new Error(`Finding events failed due to puppeteer error: ${e}`);
  } finally {
    await browser.close();
  }

  return links.map(url => {
    const id = +url.split('=')[1];
    if (!Number.isInteger(id)) {
      throw new Error('Loading event list failed: there are probably changes in Kuksa\
       that require updating this library');
    }
    return id;
  });
};

const getEventInfo = async (eventId) => {
  if (!Number.isInteger(+eventId)) {
    throw new Error('Event ID must be an integer');
  }

  let browser, res;
  try {
    browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto(`https://kuksa.partio.fi/Kotisivut/tilaisuus_tiedot.aspx?TIAId=${eventId}`);

    const datesString = await page.$eval('#lblAjankohta', e => e.textContent);
    const dates = datesString.split(' - ');
    // Only dates are known, not exact times
    const onlyDatesAvailable = datesString.indexOf('klo') === -1;

    res = {
      id: eventId,
      name: (await page.$eval('#lblTilaisuus', e => e.textContent)) || null,
      organizer: (await page.$eval('#lblJarjestajat', e => e.textContent)) || null,
      dateTimeStarts: parseDateTime(dates[0]),
      dateTimeEnds: parseDateTime(dates[1]),
      onlyDatesAvailable: onlyDatesAvailable,
      registrationEnds: parseDateTime(await page.$eval('#lblIlmoPaattyy', e => e.textContent)),
      lateRegistrationEnds: parseDateTime(await page.$eval('#lblJalkiIlmoPvm', e => e.textContent)),
      location: (await page.$eval('#lblPaikka', e => e.textContent)) || null,
      eventType: (await page.$eval('#lblTapahtumanTyyppi', e => e.textContent)) || null,
      ageGroup: (await page.$eval('#lblIkakausi', e => e.textContent)) || null,
      description: (await page.$eval('#lblKuvaus', e => e.textContent)) || null,
    };
  } catch (e) {
    throw new Error(`Finding event info failed due to puppeteer error: ${e}`);
  } finally {
    await browser.close();
  }
  return res;
};

(async () => {
  const eventIds = await getEvents({
    organizer: '9999426'
  });
  console.log('Events: ', eventIds);
  for (id of eventIds) {
    console.log('Fetching ' + id);
    const eventInfo = await getEventInfo(id);
    console.log(eventInfo);
  }
  console.log(await getEventInfo('101'));
})();

