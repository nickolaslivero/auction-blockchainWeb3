import React, { useEffect, useState } from 'react';
import Web3 from 'web3';

const MetaMaskAuth = ({ children }) => {
    const [account, setAccount] = useState(null);

    const checkMetaMaskConnection = async () => {
        if (window.ethereum) {
            try {
                const web3 = new Web3(window.ethereum);
                const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
                setAccount(accounts[0]);
                window.ethereum.on('accountsChanged', (accounts) => {
                    setAccount(accounts[0]);
                });
            } catch (error) {
                console.log('User denied account access');
            }
        } else {
            console.log('MetaMask is not installed');
        }
    };

    useEffect(() => {
        checkMetaMaskConnection();        
    }, []);

    if (!account) {
        return (
            <div>
                <p>Please connect to MetaMask to access this site.</p>
                <button onClick={checkMetaMaskConnection}>
                    Connect to MetaMask
                </button>
            </div>
        );
    }

    return children;
};

export default MetaMaskAuth;