const requireAll = requireContext => requireContext.keys().map(requireContext)
const req = require.context('svg', true, /\.svg$/)
requireAll(req)

exports.iconList = req.keys().map(filePath => filePath.split('/').slice(-1)[0].replace('.svg', ''))
