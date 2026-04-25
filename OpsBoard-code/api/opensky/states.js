const { sendJson, getOpenSkyStates } = require("../_lib/monde-data");

module.exports = async (req, res) => {
  try {
    const data = await getOpenSkyStates();
    sendJson(res, data, 200);
  } catch (error) {
    sendJson(res, {
      error: "opensky_unavailable",
      message: error.message
    }, 502);
  }
};
