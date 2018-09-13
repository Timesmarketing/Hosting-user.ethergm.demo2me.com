pragma solidity ^0.4.23;

contract Game {

    struct Gamer{
        uint256 joinRound; //加入局數
        address addr; //使用者地址
    }
    
    uint256 private constant ETH_PER_ROUND = 10000000000000000; //每一回合增加的進場費
    

    uint256 private curGamePool;    //當前遊戲獎池
    uint256 private gameStartTime = 0;   //遊戲開始時間
    uint256 private curRoundUsers = 0;
    Gamer[] public gamers;

    address public owner;
    address private agency;

    constructor(address _agency) public {
        owner = msg.sender; // 設定帳戶主人為部署者帳戶
        agency = _agency;
    }
    
    function() payable public{                
        uint256 curRound = currentRound();        //計算當前回合
  
        if(gamers.length > 0 && (curRound - gamers[gamers.length - 1].joinRound > 1)){
            resetGame();
            curRound = 1;
            curRoundUsers = 0;
            curGamePool = 0;
        } 
        
        require(ETH_PER_ROUND * (curRound - 1) + 100000000000000000 == msg.value, "Wrong Entry Fee"); 
        if(gameStartTime == 0){
            gameStartTime = now;
        }
    
       
        if (gamers.length > 0 && curRound - gamers[gamers.length - 1].joinRound == 1) {
            address(gamers[gamers.length - 1].addr).transfer(curGamePool / 5);  
            curGamePool -= curGamePool / 5;
            deleteGamerAt(gamers.length - 1);
        } 
        curGamePool += msg.value;
       
        gamers.push(Gamer({joinRound: curRound, addr: msg.sender})); 
        if (curRound - gamers[gamers.length - 1].joinRound == 0) {
            curRoundUsers ++;
        }
     
        
        if(gamers.length >= 3 && curRoundUsers % 3 == 0){
            uint256 transferAmount = calcTransferBack(gamers[0].joinRound,curRound);
            address(gamers[0].addr).transfer(transferAmount);
            curGamePool -= transferAmount;
            deleteGamerAt(0);
        }
        //add
        if(curRound >= 4) {
            resetGame();
        }
    }

    function calcTransferBack(uint256 gamerRound,uint256 curRound) private returns (uint256) {
        uint256 joinFee = ETH_PER_ROUND * (curRound - 1) + 100000000000000000;
        return  ( (joinFee / 5) + joinFee + joinFee*(ETH_PER_ROUND * (curRound - 1)) );
        // 0.1  + 
    }

    
    function currentRound() view public returns (uint256) {
        if(gameStartTime == 0)
            return 1;
            // 每回合12個小時
        return ((now - gameStartTime) / (3 * 60)) + 1;
    }

    
    function resetGame() private{
        address(agency).transfer(curGamePool * 50 / 100);
        uint lastRoundGamersCount = 0;
        uint256 lastRound = gamers[gamers.length - 1].joinRound;
        for(uint i = gamers.length - 1; i-->0; ){
            if(gamers[i].joinRound < lastRound){ 
                break;
            }
            lastRoundGamersCount++; 
        }
        uint256 transferAmount = curGamePool * 50 / 100 / lastRoundGamersCount;
        for(i = 1; i <= lastRoundGamersCount; i++){
            address(gamers[gamers.length - i].addr).transfer(transferAmount);  
        }
        gameStartTime = now; 
        delete gamers;
    }
    
    
    function withdraw() public{
        require(msg.sender == owner);
        msg.sender.transfer(address(this).balance);
    }

    function deleteGamerAt(uint index) private{
        uint len = gamers.length;
        if (index >= len) return;
        for (uint i = index; i<len-1; i++) {
            gamers[i] = gamers[i+1];
        }
        delete gamers[len-1];
        gamers.length--;
    }



}