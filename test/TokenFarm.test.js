const { assert } = require('chai');

const DappToken = artifacts.require('DappToken')
const DaiToken = artifacts.require('DaiToken')
const NovaSwap = artifacts.require('NovaSwap')

require('chai')
    .use(require('chai-as-promised'))
    .should()
function tokens(n) {
    return web3.utils.toWei(n, 'ether');
}
contract('NovaSwap', ([owner, investor]) => {
    let daiToken, dappToken, novaSwap

    before(async () => {
        //load contracts
        daiToken = await DaiToken.new()
        dappToken = await DappToken.new()
        novaSwap = await NovaSwap.new(owner, dappToken.address, daiToken.address)
        //transfer all dapp tokens to novaswap
        await dappToken.transfer(novaSwap.address, tokens('1000'))

        await daiToken.transfer(investor, tokens('500'), {from: owner })

        await novaSwap.joinWhitelist(investor, '1', {from: owner})

        await novaSwap.startSwap({from:owner})
    })


    describe('Mock DAI deployment', async() => {
        it('has a name', async() => {
            let daiToken = await DaiToken.new()
            const name = await daiToken.name()
            assert.equal(name, 'Mock DAI Token')
        })
    })

    describe('Dapp Token deployment', async() => {
        it('has a name', async() => {
            let dappToken = await DappToken.new()
            const name = await dappToken.name()
            assert.equal(name, 'DApp Token')
        })
    })

    describe('Token Farm deployment', async() => {
        
        it('contract has tokens', async() => {
            let balance = await dappToken.balanceOf(novaSwap.address)
            assert.equal(balance.toString(), tokens('1000'))
        })
    })

    describe('Token Swap', async () => {

        it('swaps mDai for DApp tokens', async () => {
            let result
                //check investor balance before staking
            result = await daiToken.balanceOf(investor) 
            assert.equal(result.toString(), tokens('500'), 'investor mock DAI wallet balance correct before swap')
            
            //check investor is whitelisted
            result = await novaSwap.isWhitelisted(investor)
            assert.equal(result.toString(), 'true', 'investor is whitelisted before attempting swap')

            //stake mock dai tokens
            await daiToken.approve(novaSwap.address, tokens('500'), {from : investor})
            await novaSwap.swap(tokens('100'), {from : investor})

            //check staking result
            result = await daiToken.balanceOf(investor)
            assert.equal(result.toString(), tokens('400'), 'investor mock DAI wallet balance correct after swap')
               //check novaSwap contract balance 
            result = await daiToken.balanceOf(novaSwap.address)
            assert.equal(result.toString(), tokens('100'), 'novaSwap contract mock DAI wallet balance correct after swap')
            //investor spent token balance is correct
            result = await novaSwap.spent(investor)
            assert.equal(result.toString(), tokens('100'), 'investor spent balance correct after spending')
           

           
            //check balances after issuance
            result = await dappToken.balanceOf(investor)
            assert.equal(result.toString(), tokens('102'), 'investor DApp Tokens wallet balance correct after swap')
            result = await dappToken.balanceOf(novaSwap.address)
            assert.equal(result.toString(), tokens('898'), 'novaSwap DApp token balance correct after swap')
            
        })
    })    
    
})
