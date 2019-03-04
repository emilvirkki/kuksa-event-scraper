// TODO add try-catch-finally blocks so that the browser won't be left open

const puppeteer = require('puppeteer');

const parseDateTime = (dateTimeStr) => {
  // TODO Actually parse the string
  return dateTimeStr;
};

const getEvents = async (organizer) => {
  //TODO allow finding events by date also
  //TODO validate parameters strictly
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
    await page.setViewport({
    width: 1200,
    height: 1400,
  });

  await page.goto('https://kuksa.partio.fi/Kotisivut/tilaisuudet.aspx');
  await page.select('#dpJarjestajaId', organizer);
  await page.click('#btnHae');
  await page.waitForNavigation();
  const links = await page.$$eval('.varilinkki', links => links.map(a => a.href));
  await browser.close();
  //TODO add self-diagnostic that checks urls are in expected format
  return links.map(url => url.split('=')[1]);
};

const getEventInfo = async (eventId) => {
  //TODO validate eventId
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
    await page.setViewport({
    width: 1200,
    height: 1400,
  });

  await page.goto(`https://kuksa.partio.fi/Kotisivut/tilaisuus_tiedot.aspx?TIAId=${eventId}`);

  const datesString = await page.$eval('#lblAjankohta', e => e.textContent);
  const dates = datesString.split(' - ');
  // Only dates are known, not exact times
  const onlyDatesAvailable = datesString.indexOf('klo') === -1;

  const res = {
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

  await browser.close();
  return res;
};

(async () => {
  const eventIds = await getEvents('9999426');
  console.log('Events: ', eventIds);
  for (id of eventIds) {
    console.log('Fetching ' + id);
    const eventInfo = await getEventInfo(id);
    console.log(eventInfo);
  }
  console.log(await getEventInfo(101));
})();

