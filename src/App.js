import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import './App.css';
import abi from "./utils/Fruit_Types.json";

const getEthereumObject = () => window.ethereum;
//check if we have authorised accounts
const findMetaMaskAccount = async () => {
  try {
    const ethereum = getEthereumObject();

    /*
    * First make sure we have access to the Ethereum object.
    */
    if (!ethereum) {
      console.error("Make sure you have Metamask!");
      return null;
    }

    console.log("We have the Ethereum object", ethereum);
    const accounts = await ethereum.request({ method: "eth_accounts" });

    if (accounts.length !== 0) {
      const account = accounts[0];
      console.log("Found an authorized account:", account);
      return account;
    } else {
      console.error("No authorized account found");
      return null;
    }
  } catch (error) {
    console.error(error);
    return null;
  }
};
const App = () => { 
  const [currentAccount, setCurrentAccount] = useState("");
  const contractAddress = "0xCFB9118bb65eb925E0111bdf7803DC745007B5d9";
  const [allFruits, setAllFruits] = useState([]);
 /**
   * Create a variable here that references the abi content in the Fruit_Types.json
   */
 const contractABI = abi.abi;

  const connectWallet = async () => {
    try {
      const ethereum = getEthereumObject();
      if (!ethereum) {
        alert("Get MetaMask!");
        return;
      }

      const accounts = await ethereum.request({
        method: "eth_requestAccounts",
      });

      console.log("Connected", accounts[0]);
      setCurrentAccount(accounts[0]);
    } catch (error) {
      console.error(error);
    }
  };

  const fruittypes = async () => {
    try {
      const { ethereum } = window;

      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const ul = document.querySelector('.items');
        const fruitsPortalContract = new ethers.Contract(contractAddress, contractABI, signer);
        var fruitnameprompt = prompt(`Enter the name of the fruit enjoy eating `);

        let count = await fruitsPortalContract.getTotalFruitTypes();
        console.log("Retrieved total fruit types count...", count.toNumber());

        const fruitTxn = await fruitsPortalContract.fruittypes(fruitnameprompt);
        console.log("Mining...", fruitTxn.hash);
        ul.firstElementChild.textContent = `Mining...${fruitTxn.hash} .... for fruit ${fruitnameprompt}`;

        await fruitTxn.wait();
        console.log(`Mined ${fruitnameprompt}-- `, fruitTxn.hash);
        ul.children[1].innerText = `Mined...${fruitTxn.hash} .... for fruit ${fruitnameprompt}`;


        count = await fruitsPortalContract.getTotalFruitTypes();
        console.log("Retrieved total fruit count...", count.toNumber());
        ul.lastElementChild.innerHTML = `Retrieved total fruit count....${count.toNumber()} `;


        // ul.children[1].innerText = 'Brad';
        // ul.lastElementChild.innerHTML = '<h1>Hello</h1>';
      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
      console.log(error);
    }
}
  // const fruittypes = () => {
    
  // }

  useEffect(async () => {
    const account = await findMetaMaskAccount();
    if (account !== null) {
      setCurrentAccount(account);
    }
  }, []);

  /*
   * Create a method that gets all waves from your contract
   */
  const getAllFruits = async () => {
    try {
      const { ethereum } = window;
      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const fruitsPortalContract = new ethers.Contract(contractAddress, contractABI, signer);

        /*
         * Call the getAllFruits method from your Smart Contract
         */
        const fruits = await fruitsPortalContract.getAllFruits();


        /*
         * We only need address, timestamp, and message in our UI so let's
         * pick those out
         */
        let fruitsCleaned = [];
        fruits.forEach(fruit => {
          fruitsCleaned.push({
            address: fruit.participant,
            timestamp: new Date(fruit.timestamp * 1000),
            fruitname: fruit.fruitname
          });
        });

        /*
         * Store our data in React State
         */
        setAllFruits(fruitsCleaned);
      } else {
        console.log("Ethereum object doesn't exist!")
      }
    } catch (error) {
      console.log(error);
    }
  }

  
  return (
    <div className="mainContainer">

      <div className="dataContainer">
        <div className="header">
        👋 Hey there!
        </div>

        <div className="bio">

        I am Maureen, glad to blockchain meet you! I love fruits, connect your Ethereum wallet and tell me which fruit types  you love!
        <br></br>
        Simply click the button and enter the name in the prompt

        </div>
        <br></br>
        <button className="fruittypesButton" onClick={fruittypes}>
          Enter a fruit type
        </button>

        {/*
         * If there is no currentAccount render this button
         */}
        {!currentAccount && (
          <button className="waveButton" onClick={connectWallet}>
            Connect Wallet
          </button>
        )}

        {allFruits.map((fruit, index) => {
          return (
            <div key={index} style={{ backgroundColor: "OldLace", marginTop: "16px", padding: "8px" }}>
              <div>Address: {fruit.address}</div>
              <div>Time: {fruit.timestamp.toString()}</div>
              <div>Message: {fruit.fruitname}</div>
            </div>)
        })}

      <ul class="items">
        <li class="item">TXN mining in progress will be shown here</li>
        <li class="item">TXN mined status will show here ... this one takes a few more seconds please be patient.</li>
        <li class="item"> Fruit Types count will show here</li>
      </ul>

      </div>
    </div>
  );
}
export default App;