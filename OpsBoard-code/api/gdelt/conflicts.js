const { sendJson, getGdeltEventFeed } = require("../_lib/monde-data");

module.exports = async (req, res) => {
  const limit = Math.max(1, Math.min(50, parseInt(req.query.limit || "20", 10) || 20));
  try {
    const data = await getGdeltEventFeed("conflicts", limit);
    sendJson(res, data, 200);
  } catch (error) {
    sendJson(res, {
      error: "gdelt_unavailable",
      type: "conflicts",
      message: error.message
    }, 502);
  }
};
