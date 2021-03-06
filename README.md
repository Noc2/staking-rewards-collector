# Staking Rewards Collector & Tax Calculator (BETA)

# Disclaimer
Everyone using this tool does so at his/her own risk. I do not guarantee that the data is valid and every user is responsible for double-checking the results of this tool. In addition, every user must do his/her own research about how stake rewards are taxable in his/her regulatory framework. 

**Note**: The current estimate of overall tax burden assumes that staking rewards are taxed as they are paid out into the account with the respective spot-price of the day. It is unclear, whether this is the right way to do it. In addition, note that you are relying on Subscan's API (for staking data) as well as CoinGecko's API (for price data).

# What can it do?
* Collect staking rewards for a given public address (either Polkadot or Kusama) for a user-specified time window. The tool calculates the sum of staking rewards within that period.
* If the time window allows it (check below some requirements for "start" and "end" date), it also collects daily price data and the fiat value of a stake reward given that day's spot price.
* If a meaningful income tax parameter is provided, it can estimate your tax burden.
* If a meaningful initial investment (in DOT or KSM) is provided, it can calculate the annualized return rate (extrapolated from your time window to one year).
* The output is stored in a "output.json" file.

# How to run?
## Requirements:
* yarn: https://classic.yarnpkg.com/en/docs/install/

## Run
* git clone git@github.com:w3f/staking-rewards-collector.git
* cd staking-rewards-collector
* (optionally): change the parameters inside the userInput.json to your needs.
* yarn
* yarn start

# How to use it?
## Input
The program takes several inputs in the 'config/userInput.json' file.

Staking Rewards:
* **address**: The Address you want to have the stake rewards parsed.
* **network**: The network you want to analyze (allowed: "polkadot" and "kusama").
* **start** (YYYY-MM-DD): The earliest day you want to analyze (Note that the earliest available prices for Polkadot are 2020-08-19 and 2019-09-20 for Kusama).
* **end** (YYYY-MM-DD): The most recent day you want to analyze.
* **initialInvestment**: The amount of tokens from which the staking rewards are generated. Used to calculate the annualizedReturn. 

Price Data:
* **currency**: In what currency you would like to have your value expressed (allowed: "chf", "usd", "eur").
* **incomeTax**: Specify your individual income tax rate (e.g., 0.07 for 7%). This only gives a reasonable output if priceData is parsed. (allowed: numbers).
* **priceData**: Do you want to look up price data for your specified range? (allowed: "y", "n"). **Note** if your specified time window exceeds 100 days the CoinGecko API will return an error.


## Output
If the script is successfully run, you can find an 'output.json' in your main folder. Copy the inside of that file and Insert that to e.g., http://jsonviewer.stack.hu/ (click at "format" after paste) to make it readable. Example output:

https://i.imgur.com/QwXEGIN.png


The **Output** contains:

### Header

* Some information of your inputs (address, network, incomeTax, currency, initialInvestment).
* **firstReward**: The day specified within your window you received your first reward.
* **lastReward**: The day specified within your window you received your last reward.
* **annualizedReturn**: The annualized return rate of your investment (if you provided a reasonable value for "initialInvestment"). The basis of this calculation is those days between "firstReward" and "lastReward". It is only reasonable if you did not change too much in your staking situation (like deposited, withdraw etc.).
* **currentValueRewardsFiat**: The current value of the staking rewards (at the most recent daily price specified by your time window).
* **totalAmountHumanReadable**: The sum of staking rewards within your specified period in (new Dot or KSM).
* **totalValueFiat**: The value of the staking rewards **based on daily prices they were received**.
* **totalTaxBurden**: The "totalValueFiat" multiplied with your incomeTax rate.

### Data

* **numberRewardsParsed**: The number of found staking rewards.
* **numberOfDays**: The days between "start" and "end".

### List

A list with objects for every day in your specified range. In the price of numbers (e.g. "amountPlanks") multiple staking rewards are added. In the case of strings, those are concanated.

# Important Notes:
* CoinGecko's API only allows for 100 requests per minute. That means, currently you a range of longer than 100 days will produce an error.
* If CoinGecko's API cannot provide daily prices (e.g., because there was no market yet), there will be an error.
