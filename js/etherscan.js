// setting up configurations
var apiToken1 = 'ND3HWS1EW6HCG5PDCPC2A4J4FJ576QR73S'
// var apiToken1 = 'MWMKRW3SRXY1WP9UJBD9ED8FASAV8V3YXQ'

// var contractAddress = '0x927F0a78B90D647eD82086D1C93a02245C631277'
var contractAddress = '0x8bd1d64b09c5c1274a21a1b0754770898fe10e1b'

var startTime = new Date(1535709600000)
console.log(startTime)
var now = new Date()
if (startTime > now) {
    $('#countDownLabel').html('Start After')
} else {
    $('#countDownLabel').html('Countdown')
}

// Get Ether Balance for a single Address
var balanceSingleAddressUrl = "https://api.etherscan.io/api?module=account&action=balance&address=" + contractAddress + "&tag=latest&apikey=" + apiToken1
// To get paginated results use page=<page number> and offset=<max records to return>
// var requestDataUrl = "https://api.etherscan.io/api?module=account&action=tokentx&contractaddress=" + contractAddress + "&address=" + targetAddress + "&page=1&offset=100&sort=asc&apikey=" + apiToken1
var queuingDataUrl = "https://api.etherscan.io/api?module=account&action=txlist&address=" + contractAddress + "&startblock=0&endblock=99999999&page=1&offset=10000&sort=desc&apikey=" + apiToken1
// get 1000 records to calculate average, in order to get round winner
var returnedDataUrl = "https://api.etherscan.io/api?module=account&action=txlistinternal&address=" + contractAddress + "&startblock=0&endblock=99999999&page=1&offset=10000&sort=desc&apikey=" + apiToken1
var getTargetSample = 5
var requestInterval = 10000

// console.log(queuingDataUrl)
// console.log(returnedDataUrl)
// https://api.etherscan.io/api?module=account&action=txlist&address=0xA62142888ABa8370742bE823c1782D17A0389Da1&startblock=0&endblock=99999999&page=1&offset=10&sort=desc&apikey=ND3HWS1EW6HCG5PDCPC2A4J4FJ576QR73S
// http://api.etherscan.io/api?module=account&action=txlist&address=0xA62142888ABa8370742bE823c1782D17A0389Da1&startblock=0&endblock=99999999&sort=asc&apikey=ND3HWS1EW6HCG5PDCPC2A4J4FJ576QR73S
// https://api.etherscan.io/api?module=transaction&action=getstatus&txhash=0x15f8e5ea1079d9a0bb04a4c58ae5fe7654b5b2b4463375ff7ffb490aa0032f3a&apikey=ND3HWS1EW6HCG5PDCPC2A4J4FJ576QR73S
// https://api.etherscan.io/api?module=contract&action=getabi&address=0xBB9bc244D798123fDe783fCc1C72d3Bb8C189413&apikey=ND3HWS1EW6HCG5PDCPC2A4J4FJ576QR73S

// *******************************************
// reconstruction the js file

// initializing requesting
// gotta request two datasets
var playerList = []
var pendingPlayerList = []
var pendingPlayerListInit = false
var tempShowPlayList = []
var playerListInit = false

// recieve
function checkNewPlayer (dataSet) {
    if (dataSet.length == 0) {
        return
    }
    if (!playerListInit) {
        for (var i = 0; i < dataSet.length; i++) {
            if (!playerList.includes(dataSet[i].from)) {
                playerList.push(dataSet[i].from) 
            }
        }
        // console.log(playerList)
        playerListInit = true
    } else {
        for (var i = 0; i < dataSet.length; i++) {
            if (!playerList.includes(dataSet[i].from)) {
                playerList.push(dataSet[i].from)
                console.log('new user', dataSet[i].from)
                var str = dataSet[i].from
                tempShowPlayList.push(str)
            }
            if (i == 100) {
                break
            }
        }
        showNewPlayer()
        playerList.push(dataSet[0].from)
    }
}
function showNewPlayer () {
    if (tempShowPlayList.length != 0) {
        var str = tempShowPlayList[0]

        $('#inCourseId').html(str.substring(0, 8) + '... Joined!')
        $('.inCourseAlert').fadeIn()
        
        setTimeout(function () {
            tempShowPlayList.shift()
            showNewPlayer()
        }, 4000)

    } else {
        $('.inCourseAlert').fadeOut()
    }
}
function checkEjectedPlayer (dataSet, index) {
    if (!index) {
        index = 0
    }
    if (dataSet.length < 1) {
        return
    }
    if (!pendingPlayerListInit) {
        for (var i = 0; i < index; i++) {
            pendingPlayerList.push(dataSet[i].from)
        }
        pendingPlayerListInit = true
    } else {
        if (index != 0) {
            if (pendingPlayerList[pendingPlayerList.length - 1] != dataSet[index - 1].from) {
                // console.log(pendingPlayerList[pendingPlayerList.length -1])
                // console.log(dataSet[index - 1].from)
                // console.log(pendingPlayerList[pendingPlayerList.length - 1] + 'out')
                var str = pendingPlayerList[pendingPlayerList.length - 1]
                $('#outCourseId').html(str.substring(0, 8) + '... is out!')
                $('.outCourseAlert').fadeIn()
                
                setTimeout(function () {
                    $('.outCourseAlert').fadeOut()
                }, 4000)
    
                pendingPlayerList.pop()
    
                checkEjectedPlayer(dataSet, index)
            }
        }
    }
}
// function added 20180829
// start time, last 168 hrs, gets first smart contract return record as next start time
// defaults envs


var endTime = new Date(startTime)
endTime.setHours(endTime.getHours() + 168)
// endTime.setMinutes(endTime.getMinutes() + 20)

async function checkStartTimeAndChunkData (recieve, expend) {
    // console.log(recieve)
    // console.log(expend)
    if (recieve.length > 0) {
        var newestReturn = new Date(recieve[0].timeStamp * 1000)
        // find first of interval 
        console.log(newestReturn > endTime)
        while (newestReturn > endTime) {
            for (var i = 0; i < recieve.length ; i++) {
                var tempTime = new Date(recieve[i].timeStamp * 1000)
                if (tempTime <= endTime) {
                    startTime = new Date(recieve[i - 1].timeStamp * 1000)
                    endTime = new Date(startTime)
                    endTime.setHours(endTime.getHours() + 168)
                    // endTime.setMinutes(endTime.getMinutes() + 20)
                    break
                }
            }
        }
    }

    var chunkedExpendDataSet = []
    for (var j = 0; j < expend.length; j++) {
        var tempTime = new Date(expend[j].timeStamp * 1000)
        if (tempTime <= startTime) {
            break
        }
        expend[j].formattedTime = tempTime
        chunkedExpendDataSet.push(expend[j])
    }

    var chunkedRecievedDataSet = []
    for (var h = 0; h < recieve.length ; h++) {
        var tempTime = new Date(recieve[h].timeStamp * 1000)
        if (tempTime <= startTime) {
            break
        }
        recieve[h].formattedTime = tempTime
        chunkedRecievedDataSet.push(recieve[h])
    }

    var data = {
        startTime: startTime,
        recieve: chunkedRecievedDataSet,
        expend: chunkedExpendDataSet
    }
    // console.log(data)
    bindEnvironment(data.startTime, data.recieve)
    manageTwoDataSets(data.recieve, data.expend)

    // return Promise.resolve(data)
}

// every 600 entries
var startFee = 0.1
var feeRate = 0.01
var startBonus = 120
var bonusRate = 1
var playerPerRound = 600

function calculateCurrentRound (dataset) {
    // console.log(dataset.length)
    if (dataset.length == 0) {
        var round = 1        
    } else {
        var round = Math.floor(dataset.length / playerPerRound) + 1
    }
    var entryFee = (startFee + feeRate * (round - 1)).toFixed(2)
    var bonus = startBonus + bonusRate * (round - 1)
    var data = {
        playerCountDown: (playerPerRound - (dataset.length % playerPerRound)),
        round: round,
        entryFee: entryFee,
        bonus: bonus
    }
    return data
}

function bindEnvironment (startTime, recieve) {
    var data = calculateCurrentRound(recieve)
    // console.log(data)
    countingDown(startTime)
    $('#round').text(data.round)
    $('.fee').text(data.entryFee)
    $('#price').text(data.bonus)
    $('#playerCountDown').text(data.playerCountDown)
}

// proccess the datasets to bind player table
function manageTwoDataSets (recieve, expend) {
    try {
        if (expend.length != 0) {
            var index = findEjectedPlayerIndex(recieve, expend)
        } else {
            var index = {
                index: 0,
                indexArray: []
            }
        }
        checkNewPlayer(recieve)
        checkEjectedPlayer(recieve, index.index)
        recieve = settingWalletRecieveData(recieve, index.indexArray)
        // bind to table
        bindToQueuingTable(recieve)
        getRoundWinner(expend)
    } catch (error) {
        console.error(error)
    }
}

// find index
function findEjectedPlayerIndex (reci, expe) {
    try {
        // checking the first position of gameover player
        var targetIndex = []
        var target = []

        var temp = []
        // eject 1 on every 3 players join
        if (expe.length < 1) {
            return
        }
        // by default, set the first 20 data to target array, and compare them to recieving array,
        // if all orders are correct, define the index
        if (expe.length > getTargetSample) {
            for (var k = 0; k < getTargetSample; k++) {
                temp.push(expe[k].to)
            }
        } else {
            for (var k = 0; k < expe.length; k++) {
                temp.push(expe[k].to)
            }
        }
        // console.log('expe' + temp.length)

        var returnIndex = Math.floor(reci.length / 3)
        // console.log('return index ' + returnIndex)
        
        for (var i = 0; i < reci.length; i++) {
            
            if ((i + 1) % playerPerRound == 0) {
                reci[i].order = i
                target.push(reci[i])    
            }
            if ((i + 1) % 3 == 0) {
                reci[(i + 1) / 3].order = ((i + 1) / 3) - 1
                target.push(reci[(i + 1) / 3])
            }
        }
        // console.log(target)
        // checking index,  start from the 4th
        for (var i = 0; i < target.length; i++) {
            if (target[i].from === temp[0]) {
                for (var j = 1; j < temp.length; j++) {
                    
                    if (i + j > parseInt(target.length - 1)) {
                        break
                    }
                    if (target[i + j].from != temp[j].from) {
                        break
                    } else if (j === temp.length - 1) {
                        console.log('the index is ' + i)
                        for (var t = 0; t < i; t++) {
                            target.shift()
                        }
                    }
                }
            }
        }

        target.forEach(doc => {
            // console.log(doc)
            targetIndex.push(doc.order)
        })

        console.log(targetIndex)

        var data = {
            index: returnIndex,
            indexArray: targetIndex
        }
        return data
    } catch (error) {
        console.error(error)
    }
}
// adding the red and green light to datasets
function settingWalletRecieveData (reci, index) {
    try {
        // console.log(index)
        // setting up queuing Table
        reci.reverse()
        for (var i = 0; i < reci.length; i++) {
            if (index.includes(i)) {
                reci[i].status = '<div class="led-green"></div>'
            } else {
                reci[i].status = '<div class="led-red"></div>'
            }
            reci[i].from = '<div class="walletAddress">' + reci[i].from + '</div>'
            reci[i].index = '<div class="reciIndex">' + (i + 1) + '</div>'
            reci[i].value = reci[i].value / 1000000000000000000
            reci[i].timeStamp = getTimeDiff(reci[i].timeStamp)
            reci[i].transactionTimeStamp = reci[i].timeStamp
        }
        // console.log(reci)
        return reci
    } catch (error) {
        console.error(error)
    }
}

var tableInit = false
var tableQ

function bindToQueuingTable (reci) {
    try {        
        if (!tableInit) {
            tableQ = $('#queuingTable').DataTable( {
                "scrollX": true,
                "order": [[ 0, 'desc']],
                "oLanguage": {
                    "sSearch": "Search Add."    
                },
                data: reci,
                "columns": [
                    { "data": "index" },
                    { "data": "status" },
                    // { "data": "timeStamp" },
                    { "data": "from" },
                    // { "data": "value" }
                ]
            });
            // Add event listener for opening and closing details
            $('#queuingTable tbody').on('click', 'tr', function () {
                var tr = $(this).closest('tr');
                var row = tableQ.row( tr );
        
                if ( row.child.isShown() ) {
                    // This row is already open - close it
                    row.child.hide();
                    tr.removeClass('shown');
                }
                else {
                    // Open this row
                    row.child( format(row.data()) ).show();
                    tr.addClass('shown');
                }
            });
            tableInit = true
        } else {
            // console.log('reInit')
            tableQ.clear()
            tableQ.rows.add(reci).draw()
        }
        function format ( d ) {
            // `d` is the original data object for the row
            return '<table cellpadding="5" cellspacing="0" border="0" style="padding-left:50px;">'+
                '<tr>'+
                    '<td>Age :</td>'+
                    '<td>'+d.timeStamp+'</td>'+
                '</tr>'+
                '<tr>'+
                    '<td>Amount:</td>'+
                    '<td>'+d.value+'</td>'+
                '</tr>'+
            '</table>';
        }
    } catch (error) {
        console.error(error)
    }
}

function getQueneData () {
    $.ajax({
        // get data who's transaction is heading to target account wallet
        url: queuingDataUrl,
        // url: 'js/testQdataSets.json',
        method: "GET",
        // dataType: "json",
        success: function (resultR) {
            // console.log(resultR)
            // get the dataset who's recieving ethereum from the target account            
            // on requestEtherScan, result.result
            // var walletRecieve = resultR
            var walletRecieve = []
            var temp = resultR.result
            for (var i = 0; i < temp.length; i++) {
                if (temp[i].isError == 0) {
                    walletRecieve.push(temp[i])
                }
            }
            // var walletRecieve = resultR.result

            // due to the ico, the first entry wont be available
            walletRecieve.pop()
            // console.log(resultR)
            $.ajax({
                url: returnedDataUrl,
                // url: 'js/testRdataSets.json',
                method: "GET",
                dataType: "json",
                success: function(resultE) {
                    // console.log(resultE)
                    var walletExpend = []
                    var temp = resultE.result
                    for (var i = 0; i < temp.length; i++) {
                        if (temp[i].isError == 0) {
                            walletExpend.push(temp[i])
                        }
                    }
                    // var walletExpend = resultE.result
                    
                    checkStartTimeAndChunkData(walletRecieve, walletExpend)
                    
                    // manageTwoDataSets(walletRecieve, walletExpend)
                    // send the dataset to calculate the round winner
                },
                error: function (error) {
                    console.log(error);
                }
            });
        },
        error: function (error) {
            console.log(error);
        }        
    });
}

// binding to returned table
var tableRInit = false
var tableR

function getRoundWinner (dataSet) {
    
    if (dataSet.length < 2) {
        return
    }
    var roundWinner = []
    var round = 1
    for (i = dataSet.length - 1; i > 0; i--) {

        if (dataSet[i - 1].value > dataSet[i].value && dataSet[i - 1].value >= 5000000000000000000) {
            // console.log(dataSet[i - 1].value)
            var data = {
                round: '<div class="">' + round + '</div>',
                crown: '<div class="crown"></div>',
                reciever: dataSet[i - 1].to,
                to: '<div class="walletAddressWinner">' + dataSet[i - 1].to + '</div>',
                amount: '<div class="">' + dataSet[i - 1].value / 1000000000000000000 + '</div>',
                bonus: dataSet[i - 1].value / 1000000000000000000
            }
            roundWinner.push(data)
            round++
            i--
        }
    }
    if (roundWinner.length > 0) {
        document.getElementById('roundWinner').innerHTML = roundWinner[roundWinner.length - 1].reciever
    }
    // reverse the array to let latest player on top
    if (!tableRInit) {
        tableR = $('#returnedTable').DataTable({
            "scrollX": true,
            "order": [[ 0, 'desc']],
            "oLanguage": {
                "sSearch": "Search Add."    
            },
            data: roundWinner,
            "columns": [
                { "data": "round" },
                { "data": "crown" },
                { "data": "to" },
                // { "data": "tokenName" },
                { "data": "amount" },
                // { "data": "to" },
                // { "data": "value" }
            ]
        });

        // // Add event listener for opening and closing details
        // $('#returnedTable tbody').on('click', 'tr', function () {
        //     // console.log('asdfasdfasdfasdfasdfdas')
        //     var tr = $(this).closest('tr');
        //     var row = tableR.row( tr );
    
        //     if ( row.child.isShown() ) {
        //         // This row is already open - close it
        //         row.child.hide();
        //         tr.removeClass('shown');
        //     }
        //     else {
        //         // Open this row
        //         row.child( formatR(row.data()) ).show();
        //         tr.addClass('shown');
        //     }
        // });

        // function formatR ( d ) {
        //     // console.log(d)
        //     if ($(window).width() < 768) {
        //         // `d` is the original data object for the row
        //         return '<table cellpadding="5" cellspacing="0" border="0" style="padding-left:50px;">'+
        //             // '<tr>'+
        //             //     '<td>Age :</td>'+
        //             //     '<td>'+d.timeStamp+'</td>'+
        //             // '</tr>'+
        //             '<tr>'+
        //                 '<td>Bonus :</td>'+
        //                 '<td>'+d.bonus+'</td>'+
        //             '</tr>'+
        //         '</table>';
        //     } else {
        //         return
        //     }
            
        // }

        tableRInit = true
    } else {
        tableR.clear()
        tableR.rows.add(roundWinner).draw()   
    }
}

getQueneData()
// requesting every 30 seconds
setInterval(function () {
    // requestEtherScan()
    getQueneData()
    getSingleAddressBalance()
    // console.log('requested etherscan')
}, requestInterval)

// utility functions
function getTimeDiff (dateString) {
    // check if the plan is expired
    var past = new Date(dateString * 1000).getTime()
    
    var now = new Date().getTime()
    // Find the distance between now an the count down date
    var distance = now - past

    var hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
    var minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60))
    var seconds = Math.floor((distance % (1000 * 60)) / 1000)
    if (hours === 0 && minutes === 0) {
        var string = seconds + "s ago"
    } else if (hours === 0 && minutes !== 0) {
        var string = minutes + "m " + seconds + "s ago"
    } else {
        var string = hours + "h " + minutes + "m " + seconds + "s ago"
    }
    return string
}
function parseDateTimeFormat (dateTime) {
    var now = new Date(dateTime)
    var mm = now.getMonth() + 1 // getMonth() is zero-based
    var dd = now.getDate()
    var hour = now.getHours()
    var min = now.getMinutes()
    var sec = now.getSeconds()
    var string = now.getFullYear() + '/' + (mm > 9 ? '' : '0') + mm + '/' + (dd > 9 ? '' : '0') + dd + ' ' + (hour > 9 ? '' : '0') + hour + ':' + (min > 9 ? '' : '0') + min + ':' + (sec > 9 ? '' : '0') + sec
    return string
}
// ***********************************
function getSingleAddressBalance () {
    $.ajax({
        // get data who's transaction is heading to target account wallet
        // url: queuingDataUrl,
        url: balanceSingleAddressUrl,
        method: "GET",
        success: function (res) {
            // console.log(res.result)
            var balance = parseFloat(res.result) / 1000000000000000000
            $('#accountBalance').html(balance.toFixed(4))
        },
        error: function (error) {
            console.log(error);
        }        
    });
}
getSingleAddressBalance()



// var round = 1
// 	var startFee = 0.1
// 	var fee = 0.01
// 	var price = 120
// 	var startTime = '2018/08/25 21:18:25'
// 	var endTime = new Date(startTime)
// 	endTime.setHours(endTime.getHours() e ndTime.getHours() + 12)
// 	var now  = new Date()
// 	// counting round
// 	while (now > endTime) {
// 		round++
// 		price += 1
// 		endTime.setHours(endTime.getHours() e ndTime.getHours() + 12)
// 		startTime = new Date(endTime)
// 	}
// 	var prefix = ''
// 	if (round < 10) {
// 		prefix = '00'
// 	} else if (round < 100) {
// 		prefix = '0'
// 	}
	
// 	fee = (startFee + (0.01 * (round - 1))).toFixed(2)
	
// 	var intRoundsLeft = 90 - parseInt(round)
// 	// console.log(intRoundsLeft)
// 	$('#roundsLeft').html(intRoundsLeft + ' Rounds Left')
	
// 	if (round == '11' || round == '12' || round == '13') {
// 		$("#round").html(prefix + round + "th");
// 	} else {
// 		switch (round % 10) {
// 			case 1:
// 				$("#round").html(prefix + round + "st");
// 				break;
// 			case 2: 
// 				$("#round").html(prefix + round + "nd");
// 				break;
// 			case 3: 
// 				$("#round").html(prefix + round + "rd");
// 				break;
// 			default:
// 				$("#round").html(prefix + round + "th");
// 				break;
// 		}	
// 	}
// 	// $("#round").html(round);
// 	$("#price").html(price);
// 	$(".fee").html(fee);

function countingDown (startTimeCounting) {
    var end = new Date(startTimeCounting)
    end.setHours(end.getHours() + 168)
    // end.setMinutes(end.getMinutes() + 20)
    // console.log(end)
    $("#getting-started")
    // Year/Month/Day Hour:Minute:Second
        .countdown(end, function(event) {
            $(this).html(
                event.strftime('%-d Days %H : %M : <span class="second-timer">%S</span>')
            )
        })
        .on('finish.countdown', function(event) {

            console.log('reset')

            var data = calculateCurrentRound([])

            $('#countDownLabel').html('CountDown')

            $('#round').text(data.round)
            $('.fee').text(data.entryFee)
            $('#price').text(data.bonus)
            $('#playerCountDown').text(data.playerCountDown)
            
            countingDown (end)
        })
}