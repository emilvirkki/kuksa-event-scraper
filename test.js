const api = require('./index.js');

(async () => {
  const eventIds = await api.getEvents({
    organizer: '9999426'
  });
  console.log('Events: ', eventIds);
  for (id of eventIds) {
    console.log('Fetching ' + id);
    const eventInfo = await api.getEventInfo(id);
    console.log(eventInfo);
  }
  console.log(await api.getEventInfo('101'));
})();
