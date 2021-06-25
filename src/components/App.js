import React, { Component } from 'react'
import Navbar from './Navbar'
import './App.css'
import Web3 from 'web3'
import BUSDToken from '../abis/BUSDToken.json'
import NovaToken from '../abis/NovaToken.json' //had this in the development server to show nova balance, not worried about this right now
import NovaSwap from '../abis/NovaSwap.json'
import Main from './Main'

class App extends Component {
//load web3
async componentWillMount() {
  await this.loadWeb3()
  await this.loadBlockchainData()
}

async loadBlockchainData() {
  const web3 = window.web3
  const accounts = await web3.eth.getAccounts()
  this.setState({account: accounts[0]}) //need to change this to something
  //load network chain ID
  const networkId = await web3.eth.net.getId()
 
      //NEED TO LOAD BUSDTOKEN HERE
    const busdTokenData = BUSDToken.networks[networkId]
    if(busdTokenData) {
      const busdToken = new web3.eth.Contract(BUSDToken.abi, '0xC3C08346480c7d6059193d9B978F19682b15524A') 
      this.setState({busdToken})
      let busdTokenBalance = await busdToken.methods.balanceOf(this.state.account).call()
      this.setState({ busdTokenBalance: busdTokenBalance.toString() })
    } else {
      window.alert('BUSDToken contract not deployed to detected network.')
    }


     // Load NovaSwap
     const novaSwapData = NovaSwap.networks[networkId]
     if(novaSwapData) {
       const novaSwap = new web3.eth.Contract(NovaSwap.abi, novaSwapData.address)
       this.setState({ novaSwap })
       let spent = await novaSwap.methods.spent(this.state.account).call()
       this.setState({ spent: spent.toString() })
     } else {
       window.alert('NovaSwap contract not deployed to detected network.')
     }
 
     this.setState({loading: false})
}

async loadWeb3 () {
  if (window.ethereum) {
    window.web3 = new Web3(window.ethereum)
    await window.ethereum.enable()
  }
  else if (window.web3) {
    window.web3 = new Web3(window.web3.currentProvider)
  }
  else {
    window.alert('Non-Ethereum browser detected. You should consider trying MetaMask!')
  }
}

swap = (amount) => {
  this.setState({ loading: true })
  this.state.busdToken.methods.approve(this.state.novaSwap.address, amount).send({ from: this.state.account }).on('transactionHash', (hash) => {
    this.state.novaSwap.methods.swap(amount).send({ from: this.state.account }).on('transactionHash', (hash) => {
      this.setState({ loading: false })
    })
  })
}




  constructor(props) {
    super(props)
    this.state = {
      account: '0x0',
      busdToken: {},
      novaToken: {},
      novaSwap: {},
      busdTokenBalance: '0',
      novaTokenBalance: '0',
      spent: '0',
      loading: true
    }
  }

  render() {
    let content
    if(this.state.loading){
      content = <p id="loader" className="text-center">Loading...</p>
    } else {
      content = <Main 
      busdTokenBalance={this.state.busdTokenBalance}
      novaTokenBalance={this.state.novaTokenBalance}
      spent={this.state.spent}
      swap={this.swap}
      
      />
    }

    return (
      <div>
        <Navbar account={this.state.account} />
        <div className="container-fluid mt-5">
          <div className="row">
            <main role="main" className="col-lg-12 ml-auto mr-auto" style={{ maxWidth: '600px' }}>
              <div className="content mr-auto ml-auto">
                <a
                  href="http://shibanova.io"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                </a>

                {content}

              </div>
            </main>
          </div>
        </div>
      </div>
    );
  }
}

export default App;
