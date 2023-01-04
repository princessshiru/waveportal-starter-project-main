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
  const contractAddress = "0xF8dEEA84109CD0DB814Ccb522Ee3f9FC86f3b98C";
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
        var fruitnameprompt = document.getElementById('fruit1name').value;
       
       // throw new Error("nimefika mapema ndio best"); // a way to die during debug MK

        let count = await fruitsPortalContract.getTotalFruitTypes();
        console.log("Retrieved total fruit types count...", count.toNumber());

        let listfruits = await fruitsPortalContract.getAllFruits();
        console.log("Retrieved fruit list ...", listfruits);

        const fruitTxn = await fruitsPortalContract.fruittypes(fruitnameprompt, { gasLimit: 300000 });
        console.log("Mining...", fruitTxn.hash);
        ul.firstElementChild.textContent = `Mining...${fruitTxn.hash} .... for fruit ${fruitnameprompt}`;

        await fruitTxn.wait();
        console.log(`Mined ${fruitnameprompt}-- `, fruitTxn.hash);
        ul.children[1].innerText = `Mined...${fruitTxn.hash} .... for fruit ${fruitnameprompt}`;


        count = await fruitsPortalContract.getTotalFruitTypes();
        console.log("Retrieved total fruit count...", count.toNumber());
        ul.lastElementChild.innerHTML = `Retrieved total fruit count....${count.toNumber()} they include ${listfruits} `;


        // ul.children[1].innerText = 'Brad';
        // ul.lastElementChild.innerHTML = '<h1>Hello</h1>';
      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
      console.log(error);
    }
}

  
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

  useEffect(() => {
    //findMetaMaskAccount();
    connectWallet();
    //getAllFruits();
  }, []);


  
  return (
    <div className="mainContainer">

      <div className="dataContainer">
        <div className="header">
        Lets track 〽️ fruits 🍑🥝🍓🥭 by popularity! 📈
        </div>

        <div className="bio">
        <br></br>
        Enter the name of your favourite fruit followed by its emoji, eg Kiwi 🥝.
        <br></br>
        </div>
        <div>
          <label htmlFor="fruit1name">Fruit Name:</label>
          <input type="text" id="fruit1name" name="fruit1name"></input>
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

      <ul className="items">
        <li className="item"></li>
        <li className="item"></li>
        <li className="item"></li>
      </ul>

      </div>
    </div>
  );
}
export default App;