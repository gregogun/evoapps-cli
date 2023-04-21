import { print } from 'gluegun'
import { Args } from '../../types'

export const printData = (data: Args) => {
  for (const key in data) {
    if (data[key]) {
      print.highlight(`${key}: ${data[key]}`)
    }
  }
}

module.exports = { printData }
