import { print } from 'gluegun'

export const checkInvalidArgs = (invalidArgs: string[]): void => {
  if (invalidArgs.length > 0) {
    if (invalidArgs.length > 1) {
      const argsAsString = invalidArgs.join().replace(',', ', ')
      print.error(
        `Invalid arguments: ${argsAsString}. Run ff-cli-test --help for more info on usage`
      )
    } else {
      print.error(
        `Invalid argument: ${print.colors.cyan(
          `[${invalidArgs[0]}]`
        )} Run ff-cli-test --help for more info on usage`
      )
    }
    process.exit(1)
  } else {
    return
  }
}

module.exports = { checkInvalidArgs }
