var testData = [
  {name: "Test #1", url: "https://test1.com", id: "1"},
  {name: "Test #2", url: "https://example.test2.com", id: "2"},
  {name: "Test #3", url: "https://3test.org", id: "3"},
  {name: "Test #4", url: "https://signup.4test.net/", id: "4"},
  {name: "Test #5", url: "http://testtesttesttesttest.me", id: "5"}
];

var Result = React.createClass({
  viewFull: function() {
    this.props.onSelected(this.props.data);
  },
  render: function() {
    return (
      <div className="search-result col-lg-3 col-md-4 col-sm-6 col-xs-12" onClick={this.viewFull}>
        <h2>
          {this.props.data.name}
        </h2>
        <h4>
          {this.props.data.url}
        </h4>
        <h5>
          Some short description here?
        </h5>
      </div>
    );
  }
});

var SearchResults = React.createClass({
  selectResult: function(data) {
    this.props.onResultSelected(data)
  },
  render: function() {
    var that = this;
    var results = this.props.data.map(function (result) {
      return (
        <Result key={result.id} data={result} onSelected={that.selectResult} />
      );
    });

    return (
      <div className="search-results row">
        {results}
      </div>
    );
  }
});

var SearchBox = React.createClass({
  onTextChange: function(e) {
    this.props.onSearchTextChange(React.findDOMNode(this.refs.text).value);
  },
  edit: function(e) {
    var currentSearch = React.findDOMNode(this.refs.text).value;
    this.props.onSearchTextChange(currentSearch);
    history.pushState(null, null, "/search?q=" + currentSearch);
  },
  render: function() {
    if (this.props.isReadonly !== true) {
      return (
        <div className="search-box">
          <input type="text" onChange={this.onTextChange} className="form-control input-lg" ref="text"
                 placeholder="Give me a service name or URL!" value={this.props.initialSearch} />
        </div>
      );
    } else {
      return (
          <div className="search-box">
            <input type="text" onChange={this.onTextChange} onClick={this.edit} className="form-control input-lg disabled" ref="text"
                   placeholder="Give me a service name or URL!" value={this.props.initialSearch} />
          </div>
        );
    }
  }
});

var SearchPage = React.createClass({
  getSearchParam: function() {
    var search = window.location.search;
    if (search.startsWith("?q=")) {
      return search.substring(search.indexOf("=")+1);
    }
  },
  getInitialState: function() {
    var query = this.getSearchParam();
    return {
      data: this.getFilteredData(query),
      selected: this.props.selected || -1,
      initialSearch: query
    };
  },
  getFilteredData: function(query) {
    query = $.trim(query);
    if (this.isMounted()) {
      this.setState({initialSearch: query});
    }
    if (query === "") {
      return [];
    }
    return testData.filter(function(val) {
      return val.name.indexOf(query) > -1 || val.url.indexOf(query) > -1;
    });
  },
  handleSearchTextChange: function(query) {
    var data = this.getFilteredData(query);
    if (data.length > 0) {
      if (this.props.onNonEmptySearch) {
        this.props.onNonEmptySearch();
      }
    } else {
      if (this.props.onEmptySearch) {
        this.props.onEmptySearch();
      }
    }
    this.setState({data: data, selected: -1});
  },
  resultSelected: function(data) {
    this.setState({selected: data});
    var searchText = $(React.findDOMNode(this.refs.searchbox)).find("input").val()
    history.pushState(null, null, "/search?q=" + searchText);
    history.pushState(null, null, "/service/" + data.id + "?q=" + searchText);
  },
  render: function() {
    if (this.state.selected === -1) {
      return (
        <div className="search-area">
          <SearchBox onSearchTextChange={this.handleSearchTextChange} ref="searchbox" initialSearch={this.state.initialSearch}/>
          <SearchResults data={this.state.data} onResultSelected={this.resultSelected} />
        </div>
      );
    } else {
      var searchText = this.state.initialSearch || this.getSearchParam() || this.state.selected.name
      return (
        <div className="search-area">
          <SearchBox onSearchTextChange={this.handleSearchTextChange} ref="searchbox" initialSearch={this.state.initialSearch || this.state.selected.name} isReadonly={true}/>
          <ServicePage data={this.state.selected} />
        </div>
      )
    }
  }
});