
const NovaSwap = artifacts.require('NovaSwap')

module.exports = async function(deployer, network, accounts) {
 
    const _owner = '0xB8419aBa04B8b36E26E80b2b8284f1e0DA077bB2' 
    const _BUSDToken = '0xC3C08346480c7d6059193d9B978F19682b15524A' //currently set to a test token
    const _novaToken = '0x56E344bE9A7a7A1d27C854628483Efd67c11214F' //currently set to test nova
    await deployer.deploy(NovaSwap, _owner, _BUSDToken, _novaToken)
    

  
}
