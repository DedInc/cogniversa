function getUnix() {
    return Math.floor(Date.now() / 1000);
}

module.exports = {
  getUnix
};