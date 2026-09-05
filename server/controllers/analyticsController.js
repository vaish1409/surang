const Order   = require('../models/Order');
const Artwork = require('../models/Artwork');

/**
 * Platform-wide demand signals: which categories are actually selling,
 * and where (by buyer's shipping state). This is the "market-linkage"
 * feature — it gives every artisan visibility into real demand that used
 * to sit only with middlemen. Aggregated from paid orders, so it's always
 * grounded in real transactions, never guesswork.
 *
 * Safe on an empty/near-empty dataset: returns empty arrays rather than
 * erroring, so the UI can show an honest "not enough data yet" state
 * instead of breaking.
 */
exports.getDemandSignals = async (req, res) => {
  try {
    const rows = await Order.aggregate([
      { $match: { isPaid: true } },
      { $unwind: '$items' },
      {
        $lookup: {
          from: 'artworks',
          localField: 'items.artwork',
          foreignField: '_id',
          as: 'artworkDoc',
        },
      },
      { $unwind: '$artworkDoc' },
      {
        $group: {
          _id: { category: '$artworkDoc.category', state: '$shippingAddress.state' },
          unitsSold: { $sum: '$items.quantity' },
          revenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } },
        },
      },
    ]);

    const overallMap = {};
    const stateMap = {};

    for (const row of rows) {
      const category = row._id.category || 'Other';
      const state = row._id.state || 'Unknown';

      overallMap[category] = (overallMap[category] || 0) + row.unitsSold;

      if (!stateMap[state]) stateMap[state] = {};
      stateMap[state][category] = (stateMap[state][category] || 0) + row.unitsSold;
    }

    const topCategoriesOverall = Object.entries(overallMap)
      .map(([category, unitsSold]) => ({ category, unitsSold }))
      .sort((a, b) => b.unitsSold - a.unitsSold);

    const demandByState = Object.entries(stateMap)
      .map(([state, categories]) => {
        const sorted = Object.entries(categories).sort((a, b) => b[1] - a[1]);
        return {
          state,
          topCategory: sorted[0]?.[0] || null,
          unitsSold: sorted[0]?.[1] || 0,
          breakdown: sorted.map(([category, unitsSold]) => ({ category, unitsSold })),
        };
      })
      .sort((a, b) => b.unitsSold - a.unitsSold);

    res.json({ topCategoriesOverall, demandByState });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * One artist's own performance: views vs. actual sales per artwork, so
 * they can see what's converting and what isn't — not just "how many
 * views" but "how many views turned into a sale."
 */
exports.getMyPerformance = async (req, res) => {
  try {
    const artworks = await Artwork.find({ artist: req.user._id })
      .select('title category views soldCount price');

    const totalViews = artworks.reduce((sum, a) => sum + (a.views || 0), 0);
    const totalSold  = artworks.reduce((sum, a) => sum + (a.soldCount || 0), 0);
    const conversionRate = totalViews > 0 ? +((totalSold / totalViews) * 100).toFixed(1) : 0;

    const byCategory = {};
    artworks.forEach((a) => {
      byCategory[a.category] = (byCategory[a.category] || 0) + (a.soldCount || 0);
    });
    const myTopCategory = Object.entries(byCategory).sort((a, b) => b[1] - a[1])[0]?.[0] || null;

    const perArtwork = artworks
      .map((a) => ({
        id: a._id,
        title: a.title,
        category: a.category,
        views: a.views || 0,
        soldCount: a.soldCount || 0,
        conversionRate: a.views > 0 ? +((a.soldCount / a.views) * 100).toFixed(1) : 0,
      }))
      .sort((a, b) => b.views - a.views);

    res.json({
      totalViews,
      totalSold,
      conversionRate,
      myTopCategory,
      totalEarnings: req.user.totalEarnings || 0,
      perArtwork,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
