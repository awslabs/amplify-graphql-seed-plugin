const Table = require('cli-table')

module.exports.showHelp = (input, context) => {
  // Take help context in the format:

  const table = new Table({
    chars: {
      top: '',
      'top-mid': '',
      'top-left': '',
      'top-right': '',
      bottom: '',
      'bottom-mid': '',
      'bottom-left': '',
      'bottom-right': '',
      left: '',
      'left-mid': '',
      mid: '',
      'mid-mid': '',
      right: '',
      'right-mid': '',
      middle: ' '
    },
    style: { 'padding-left': 0, 'padding-right': 0 }
  })

  for (const item of input) {
    table.push([item.name, item.description, ''])
  }

  context.print.info(table.toString())
  return table.toString()
}
