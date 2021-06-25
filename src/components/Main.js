import React, { Component } from 'react'
import busd from '../busd.png'


class Main extends Component {


  render() {
    return (
      <div id="content" className="mt-3">
        
        <table className="table table-borderless text-muted text-center">
          <thead>
            <tr>
              <th scope="col">Spent BUSD Balance</th>
              <th scope="col">NOVA Balance</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>{window.web3.utils.fromWei(this.props.spent, 'Ether')} BUSD</td>
              <td>{window.web3.utils.fromWei(this.props.novaTokenBalance, 'Ether')} NOVA</td>
            </tr>
          </tbody>
        </table>  
        
        <div className="card mb-4" >

<div className="card-body">

  <form className="mb-3" onSubmit={(event) => {
      event.preventDefault()
      let amount
      amount = this.input.value.toString()
      amount = window.web3.utils.toWei(amount, 'Ether')
      this.props.swap(amount)
    }}>
    <div>
      <label className="float-left"><b>Swap BUSD</b></label>
      <span className="float-right text-muted">
        Balance: {window.web3.utils.fromWei(this.props.busdTokenBalance, 'Ether')}
      </span>
    </div>
    <div className="input-group mb-4">
      <input
        type="text"
        ref={(input) => { this.input = input }}
        className="form-control form-control-lg"
        placeholder="0"
        required />
      <div className="input-group-append">
        <div className="input-group-text">
          <img src={busd} height='32' alt=""/>
          &nbsp;&nbsp;&nbsp; BUSD
        </div>
      </div>
    </div>
    <button type="submit" className="btn btn-primary btn-block btn-lg">Purchase NOVA</button>
  </form>
  
</div>
</div>

      </div>
    );
  }
}

export default Main;
