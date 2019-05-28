# Event Screper for Kuksa

Library that scrapes events from [Kuksa's event listing](https://kuksa.partio.fi/kotisivut/tilaisuudet.aspx) using Puppeteer.

## Installation

Clone this repository and run `npm install`

## Usage

```javascript
const kuksa = require('/path/to/kuksa-event-scraper');

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

Returns the ids of the events as an array, e.g.

```javascript
[
  27956,
  28052,
  27466
]
```

Currently the only supported filter is `organizer`, which is the event organizer's id in Kuksa. You can find the ID of your troop by inspecting the organiser select in the kuksa event list.

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
  location: 'Mallikkalan Leirialua',
  eventType: 'Leiri (väh. 3 yötä)',
  ageGroup: 'Seikkailijat', // age group, if available
  descriptionText: 'Leirillä on luvassa kivaa puuhaa',
  descriptionHTML: '<span style="font-size: 13.3333px;">Leirillä on luvassa <b>kivaa puuhaa</b></span>' }
```

If an event with the given id is not found, returns `null`.
