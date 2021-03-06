import { round, pow } from 'mathjs';

export function dateToString(date){
    let day = date.getDate().toString();
    let month = (date.getMonth() + 1).toString();
    let year = date.getFullYear().toString();
  
    if(day.length == 1){
      day = day.concat('0');
      day = _reverseString(day);
    }
  
    if(month.length == 1){
      month = month.concat('0');
      month = _reverseString(month);
    }
    return day.concat('-', month, '-', year);
  }

export function makeDaysArray(start, end) {
    for(var arr=[],dt=new Date(start); dt<=end; dt.setDate(dt.getDate()+1)){
        arr.push(new Date(dt));
    }
    arr = _transformArrayToString(arr);
    return arr;
};

export function initializeObject(daysArray, network, address, currency, incomeTax, initialInvestment){
    let obj = {
        'message': 'empty',
        'address': address,
        'network': network,
        'currency': currency,
        'incomeTax': incomeTax,
        'initialInvestment': initialInvestment,
        'firstReward': '',
        'lastReward': '',
        'annualizedReturn':0,
        'currentValueRewardsFiat':0,
        'totalAmountHumanReadable':0,
        'totalValueFiat': 0,
        'totalTaxBurdenFiat': 0,
        'data':{
            'numberRewardsParsed': 0,
            'numberOfDays': daysArray.length,
            'list':[]
        }
    }
    for(let i = 0; i < daysArray.length; i++){
        obj.data.list[i] = {
            'day' : daysArray[i],
            'blockNumber': '',
            'extrinsicHash': '',
            'price': 0,
            'amountPlanks': 0,
            'numberPayouts':0,
            'amountHumanReadable': 0,
            'valueFiat':0,
            'valueTaxable':0
        }
    }
    return obj;
}

function _reverseString(string){
    var i;
    let length = string.length;
    var tmp_string = '';
  
    for(i = 0; i < string.length; i++){
      tmp_string = tmp_string.concat(string[length-1]);
      length -= 1;
    }
    return tmp_string;
}

function _transformArrayToString(array){
    let newArray = [];
  
    for(let i = 0; i < array.length; i++){
      newArray[i] = dateToString(array[i]);
    }
    return newArray;
}

export function transformDDMMYYYtoUnix(dateString){

    var dateParts = dateString.split('-');
    let date = new Date(+dateParts[2], dateParts[1] - 1, +dateParts[0]);
    let unix = date.valueOf() / 1000;

    return unix;
}

export function min(a,b){
    var min;
    if(a>b){
        min = b; 
    }else {
        min = a;
    }
    return min;
}

export function calculateMetrics(obj){
    var normalization;

    if(obj.network == 'polkadot'){
        normalization = 1/10000000000;
    } else {
        normalization = 1/1000000000000;
    }
    for(let i = 0; i < obj.data.numberOfDays; i++){
        obj.data.list[i].amountHumanReadable = obj.data.list[i].amountPlanks * normalization;
        obj.data.list[i].valueFiat = obj.data.list[i].amountHumanReadable * obj.data.list[i].price;
        obj.data.list[i].valueTaxable = obj.data.list[i].valueFiat * obj.incomeTax;
        obj.totalValueFiat = obj.totalValueFiat + obj.data.list[i].valueFiat;
        obj.totalTaxBurdenFiat =  obj.totalTaxBurdenFiat + obj.data.list[i].valueTaxable;
        obj.totalAmountHumanReadable = obj.totalAmountHumanReadable + obj.data.list[i].amountHumanReadable;
    }

    obj.totalValueFiat = round(obj.totalValueFiat,2);
    obj.totalAmountHumanReadable = round(obj.totalAmountHumanReadable,2);
    obj.totalTaxBurdenFiat = round(obj.totalTaxBurdenFiat,2);
    obj.currentValueRewardsFiat = round(obj.totalAmountHumanReadable * obj.data.list[0].price,2);
    obj.annualizedReturn = _calculateAnnualizedReturn(obj);
    
    return obj;
}

function _calculateAnnualizedReturn(obj){
    var annualized;
    var firstAndLastReward;
    var daysBetweenRewards;

    firstAndLastReward = _getFirstandLastReward(obj);
    obj.firstReward = firstAndLastReward.firstReward;
    obj.lastReward = firstAndLastReward.lastReward;
    //added one day because users must lock for one day and wait.
    daysBetweenRewards =  ((transformDDMMYYYtoUnix(obj.lastReward) - transformDDMMYYYtoUnix(obj.firstReward)) / 60 / 60 / 24) + 1;
    let rateOfReturn = 1 + obj.totalAmountHumanReadable /obj.initialInvestment;
    let daysFraction = 365 / daysBetweenRewards;
    annualized = pow(rateOfReturn,daysFraction) - 1;

    return annualized;
}

function _getFirstandLastReward(obj){
    let i = 0;
    let max = obj.data.numberOfDays;
    let x = max;
    var firstReward;
    var lastReward;

    while (i < max) {
        i++;
        if (obj.data.list[i].numberPayouts != 0) {    
            firstReward = obj.data.list[i].day; 
            break;
        } 
    }

    while (x > 0) {
        x--;
        if (obj.data.list[x].numberPayouts != 0) {    
           lastReward = obj.data.list[x].day;
            break;
        } 
    }
    return {
        'firstReward': firstReward,
        'lastReward': lastReward
    }
}

export function verifyUserInput(userInput){
    let start = new Date(userInput.start);
    let end = new Date(userInput.end);
    let distance = (end - start) / (1000*3600*24);
    let network = userInput.network;
    let priceData = userInput.priceData;

    if(start > end){
        throw new Error('Start date must be before end date')
    }

    if(distance > 100 & userInput.priceData == 'y'){
        throw new Error('Your time window is more than 100 days and you are requesting price data. That is not possible. Either specify a shorter period of time between start and end date or turn off price data.');
    }

    if(end > new Date()){
        throw new Error('Start date is in the future.');
    }

    if(start.valueOf() < 1597795200000 & network == 'polkadot' & priceData == 'y'){
        throw new Error('You are requesting price data when there were no prices available.');
    }
    
    if(start.valueOf() < 1568937600000 & network == 'kusama' & priceData == 'y'){
        throw new Error('You are requesting price data when there were no prices available.');
    }

}