const { sendJson, getGdeltEventFeed } = require("../_lib/monde-data");

module.exports = async (req, res) => {
  const limit = Math.max(1, Math.min(50, parseInt(req.query.limit || "12", 10) || 12));
  try {
    const data = await getGdeltEventFeed("protests", limit);
    sendJson(res, data, 200);
  } catch (error) {
    sendJson(res, {
      error: "gdelt_unavailable",
      type: "protests",
      message: error.message
    }, 502);
  }
};
