import React from 'react';
import request from 'superagent';

export default class MatadorSearch extends React.Component {
  state = {
    term: '',
    results: [],
    pendingSelection: '',
    showResults: false,
    pendingIndex: 0
  }

  getResults = (term) => {
    this.setState({
      pendingIndex: 0
    });
    request.get(`https://financialmodelingprep.com/api/v3/search?query=${term}&limit=10`)
      .then((res) => {
        if (!res.body || !res.body.length) {
          this.setState({
            results: [],
            showResults: false
          });
          return;
        }
        this.setState({
          results: res.body,
          pendingSelection: res.body[this.state.pendingIndex].symbol,
          showResults: true
        });
      });
  }

  onInputChange = (event) => {
    this.setState({
      term: event.target.value
    });
    if (event.target.value.length) {
      this.getResults(event.target.value);
    } else {
      this.setState({
        showResults: false
      });
    }
  }

  handleSubmit = (event) => {
    event.preventDefault();
    this.getDataForSymbol(this.state.pendingSelection);
  }

  getDataForSymbol = (symbol) => {
    this.props.getDataForSymbol(symbol);
    this.confirmSelection();
  }

  confirmSelection = () => {
    this.setState({
      showResults: false,
      term: '',
      pendingSelection: '',
      results: [],
      pendingIndex: 0
    });
  }

  selectResult = (id) => {
    this.getDataForSymbol(id);
  }

  setPendingSelection = (idx) => {
    this.setState({
      pendingIndex: idx,
      pendingSelection: this.state.results[idx].symbol
    });
  }

  mouseEnterHandler = (idx) => {
    this.setPendingSelection(idx);
  }

  keydownHandler = (event) => {
    if (event.key === 'ArrowDown') {
      if (this.state.pendingIndex === this.state.results.length - 1) {
        return;
      }
      this.setPendingSelection(this.state.pendingIndex + 1);
    } else if (event.key === 'ArrowUp') {
      if (this.state.pendingIndex === 0) {
        return;
      }
      this.setPendingSelection(this.state.pendingIndex - 1);
    }
  }

  componentDidMount() {
    window.addEventListener('keydown', this.keydownHandler);
  }

  componentWillUnmount() {
    window.removeEventListener('keydown', this.keydownHandler);
  }

  renderResults = (results) => {
    return (
      <div className='search--results'>
        {results.map((result, idx) => {
          return (
            <div
              className={result.symbol === this.state.pendingSelection ? 'search--result search--result-pending' : 'search--result'}
              onClick={() => this.selectResult(result.symbol)}
              onMouseEnter={()=> this.mouseEnterHandler(idx)}>
              <strong>
                {result.name}
              </strong>
              <br />
              <span>
                {result.symbol} ({result.exchangeShortName})
              </span>
            </div>
          )
        })}
      </div>
    )
  }

  render() {
    return (
      <div className='header'>
        <form className='search' onSubmit={this.handleSubmit}>
          <input type='text' value={this.state.term} onChange={this.onInputChange} placeholder="Search for a company"></input>
          {this.state.showResults && this.renderResults(this.state.results)}
        </form>
      </div>
    )
  }
}