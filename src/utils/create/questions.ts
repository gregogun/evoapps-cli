import { PromptOptions } from 'gluegun/build/types/toolbox/prompt-enquirer-types'

export const askTitle: PromptOptions = {
  name: 'title',
  message: 'Enter the name of your app',
  type: 'input',
  hint: 'Max. 80 Characters',
}

export const askDescription: PromptOptions = {
  name: 'description',
  message: 'Enter a description for your app',
  type: 'input',
  hint: 'Max. 300 Characters',
}

export const askAppId: PromptOptions = {
  name: 'appId',
  message: 'Provide an App ID',
  type: 'input',
}

export const askTopics: PromptOptions = {
  name: 'topics',
  message: 'Enter a list of comma-separated topics',
  type: 'input',
}

export const askNotes: PromptOptions = {
  name: 'notes',
  message: 'Add a path to your release notes',
  type: 'input',
}

export const askManifest: PromptOptions = {
  name: 'manifest',
  message: 'Provide the transaction ID of your app manifest',
  type: 'input',
}

export const askSourceCode: PromptOptions = {
  name: 'sourceCode',
  message: 'Provide the transaction ID of your source code',
  type: 'input',
}

export const askForks: PromptOptions = {
  name: 'forks',
  message: 'Provide the Version ID of the version you wish to fork',
  type: 'input',
}

export const askWalletPath: PromptOptions = {
  name: 'walletPath',
  message: 'Add a path to your arweave wallet',
  type: 'input',
}

export const askBalances: PromptOptions = {
  name: 'balances',
  message: 'Set a token balance for your wallet',
  type: 'numeral',
}

module.exports = {
  askAppId,
  askTitle,
  askDescription,
  askBalances,
  askTopics,
  askNotes,
  askManifest,
  askSourceCode,
  askForks,
  askWalletPath,
}
