const api = require('./index.js');
const expect = require('chai').expect;

const KORVEN_VAELTAJAT_ID = 9999426;

console.warn('This tests against the live Kuksa instance. Remember that the tests may fail also '
  + 'because the events have been edited.');

describe('getEvents()', function() {
  // The scraping is slow
  this.timeout(20*1000);

  it('returns correct event ids for organizer', async function() {
    const eventIds = await api.getEvents({
      organizer: KORVEN_VAELTAJAT_ID,
      dateStart: new Date('2018-05-29T12:00:00'),
      dateEnd: new Date('2018-09-30T12:00:00'),
    });
    expect(eventIds).to.eql([21628, 21845, 23159]);
  });

  it('returns correct event ids without organizer', async function() {
    const eventIds = await api.getEvents({
      dateStart: new Date('2018-06-01T12:00:00'),
      dateEnd: new Date('2018-06-02T12:00:00'),
    });
    expect(eventIds).to.eql([24732, 14188, 18968]);
  });

  it('returns a lot of events without any filters', async function() {
    const eventIds = await api.getEvents();
    expect(eventIds.length).to.greaterThan(500);
    expect(eventIds.some(i => !Number.isInteger(i))).to.be.false;
  });

  it('events with only start filter set', async function() {
    const eventIds = await api.getEvents({
      dateStart: new Date('2021-01-01T12:00:00'),
    });
    expect(eventIds.length).to.greaterThan(100);
    expect(eventIds.some(i => !Number.isInteger(i))).to.be.false;
  });

  it('throws error for non-integer organizer', async function() {
    try {
      await api.getEvents({
        organizer: 'this is an invialid id',
      });
      expect.fail('should have thrown');
    } catch (e) { }
  });
});

describe('getEventInfo()', function() {
  // The scraping is slow
  this.timeout(10*1000);

  it('returns correct text field content', async function() {
    const res = await api.getEventInfo(123);
    expect(res.id).to.equal(123);
    expect(res.organizer).to.equal('Hämeen Partiopiiri ry');
    expect(res.name).to.equal('Luotsikurssi');
    expect(res.location).to.equal('Kunstenniemi, Naantali');
    expect(res.eventType).to.equal('Koulutustoiminta');
    expect(res.descriptionText).to.have.string(
      '\nKoulutus järjestetään YTP-kurssina yhteistyössä Lounais-Suomen Partiopiirin kanssa.\n'
    );
    expect(res.descriptionHTML).to.have.string(
      '<p>Koulutus järjestetään YTP-kurssina yhteistyössä Lounais-Suomen Partiopiirin kanssa.<br>'
    );
  });

  it('returns null when the event does not exist', async function() {
    const res = await api.getEventInfo(1234);
    expect(res).to.be.null;
  });

  it('returns dates without times correctly', async function() {
    const res = await api.getEventInfo(123);
    expect(res.onlyDatesAvailable).to.equal(true);

    // The different time zones are intentional - summer time ended on Oct 26th early morning
    expect(res.dateTimeStarts.toString()).to.match(/^Fri Oct 24 2014 12:00:00 GMT\+0300.*/);
    expect(res.dateTimeEnds.toString()).to.match(/^Sun Oct 26 2014 12:00:00 GMT\+0200.*/);
    expect(res.registrationEnds.toString()).to.match(/^Sun Aug 24 2014 12:00:00 GMT\+0300.*/);
  });

  it('returns dates with times correctly', async function() {
    const res = await api.getEventInfo(18215);
    expect(res.onlyDatesAvailable).to.equal(false);
    expect(res.dateTimeStarts.toString()).to.match(/^Fri Dec 08 2017 17:00:00 GMT\+0200.*/);
    expect(res.dateTimeEnds.toString()).to.match(/^Sun Dec 10 2017 13:00:00 GMT\+0200.*/);
    // Registration ends is a date without time -> default to 12:00
    expect(res.registrationEnds.toString()).to.match(/^Thu Dec 07 2017 12:00:00 GMT\+0200.*/);
  });

  it('returns null for empty fields', async function() {
    const res = await api.getEventInfo(18215);
    expect(res.location).to.be.null;
    expect(res.ageGroup).to.be.null;
    expect(res.descriptionText).to.be.null;
    expect(res.descriptionHTML).to.be.null;
  });

  it('throws error for non-integer event id', async function() {
    try {
      await api.getEventInfo('not a valid id');
      expect.fail('should have thrown');
    } catch (e) { }
  });
});
