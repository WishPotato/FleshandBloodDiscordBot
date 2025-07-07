let eventUnlocked = true;

function getEventState() {
  return eventUnlocked;
}

function setEventState(value) {
  eventUnlocked = value;
}

module.exports = {
  getEventState,
  setEventState
};