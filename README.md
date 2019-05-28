# Event Scraper for Kuksa

Library that scrapes events from [Kuksa's event listing](https://kuksa.partio.fi/kotisivut/tilaisuudet.aspx) using Puppeteer.

## Installation

You can install the library using `npm install kuksa-event-scraper`

## Usage

```javascript
const kuksa = require('kuksa-event-scraper');

(async () => {
  const eventIds = await kuksa.getEvents({
    organizer: 9999426, // ID of organizer (optional)
  });
  console.log(eventIds); // Prints ids of matching events, e.g. [123, 234]

  const eventInfo = await kuksa.getEventInfo(123);
  console.log(eventInfo); // Prints an object representing the event
})()
```

### getEvents(filters)

Returns the ids of the events matching the filters as an array, e.g.

```javascript
[
  27956,
  28052,
  27466
]
```

If filter is not given, returns all events.

Currently the only supported filter is `organizer`, which is the event organizer's id in Kuksa. You can find the ID of your troop by inspecting the organiser select in the kuksa event list.

The available filters are:

```javascript
{
  organizer: 9999426, // id of the organizer, e.g. troop (optional)
  dateStart: new Date(), // only list events starting after this date (optional)
  dateEnd: new Date(), // only list events before this date (optional)
}
```

You can combine different filters as you like. You can find the available organiser ids for example by inspecting the [event search](https://kuksa.partio.fi/kotisivut/tilaisuudet.aspx) organiser dropdown with developer tools.

### getEventInfo(eventId)

Returns the details of an event, e.g.

```javascript
{ id: 12312, // same as the id you gave
  name: 'Kesäleiri 2017',
  organizer: 'Matinkylän Mallikkaat ry',
  dateTimeStarts: new Date('2017-07-21T09:00:00.000Z'),
  dateTimeEnds: new Date('2017-07-27T09:00:00.000Z'),
  onlyDatesAvailable: true, // true if the exact starting and ending time is not available
  registrationEnds: new Date('2017-06-14T09:00:00.000Z'),
  lateRegistrationEnds: new Date('2017-07-14T09:00:00.000Z'),
  location: 'Mallikkalan Leirialue',
  eventType: 'Leiri (väh. 3 yötä)',
  ageGroup: 'Seikkailijat', // age group, if available
  descriptionText: 'Leirillä on luvassa kivaa puuhaa',
  descriptionHTML: '<span style="font-size: 13.3333px;">Leirillä on luvassa <b>kivaa puuhaa</b></span>' }
```

If an event with the given id is not found, returns `null`.
