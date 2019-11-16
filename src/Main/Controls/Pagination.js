import React from 'react';
import _ from 'lodash';

const defaultProps = {
  initialPage: 1
};

class Pagination extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      pager: {}
    };
  }

  componentWillMount() {
    // set page if items array isn't empty
    if (this.props.items && this.props.items.length) {
      this.setPage(this.props.initialPage);
    }
  }

  componentDidUpdate(prevProps, prevState) {
    console.log("componentDidUpdate");

    if(!this.props.items || this.props.items===[]){
      console.log("DESTROY!");
      this.props.onChangePage([]);
    }
    if (this.props.items !== prevProps.items) {
      this.setPage(this.props.initialPage);
    } else if (this.props.onSelected !== prevProps.onSelected)
      this.setPage(this.props.onSelected);
  }

  setPage(page) {
    var items = this.props.items;
    var pager = this.state.pager;

    if ((page < 1 || page > pager.totalPages) && pager.totalItems === items.length)
      return;
    pager = this.getPager(items.length, page);
    var pageOfItems = items.slice(pager.startIndex, pager.endIndex + 1);

    this.setState({ pager });
    this.props.onChangePage(pageOfItems, page);
  }

  getPager(totalItems, currentPage, pageSize) {
    currentPage = currentPage || 1;
    pageSize = pageSize || 10;
    var totalPages = Math.ceil(totalItems / pageSize);

    var startPage, endPage;
    if (totalPages <= 10) {
      startPage = 1;
      endPage = totalPages;
    } else {
      if (currentPage <= 6) {
        startPage = 1;
        endPage = 10;
      } else if (currentPage + 4 >= totalPages) {
        startPage = totalPages - 9;
        endPage = totalPages;
      } else {
        startPage = currentPage - 5;
        endPage = currentPage + 4;
      }
    }

    var startIndex = (currentPage - 1) * pageSize;
    var endIndex = Math.min(startIndex + pageSize - 1, totalItems - 1);

    var pages = _.range(startPage, endPage + 1);

    return {
      totalItems, currentPage, pageSize, totalPages,
      startPage, endPage, startIndex, endIndex, pages
    };
  }

  render() {
    var pager = this.state.pager;

    if (!pager.pages || pager.pages.length <= 1)
      return null;

    return (<ul className="pagination justify-content-center">
      <li className={"page-item " + (
        pager.currentPage === 1
          ? 'disabled'
          : '')}>
        <a className="page-link" onClick={() => this.setPage(1)}>First</a>
      </li>
      <li className={"page-item " + (
        pager.currentPage === 1
          ? 'disabled'
          : '')}>
        <a className="page-link" onClick={() => this.setPage(pager.currentPage - 1)}>Previous</a>
      </li>
      {
        pager.pages.map((page, index) => <li key={index} className={"page-item " + (
          pager.currentPage === page
            ? 'active'
            : '')}>
          <a className="page-link" onClick={() => this.setPage(page)}>{page}</a>
        </li>)
      }
      <li className={"page-item " + (
        pager.currentPage === pager.totalPages
          ? 'disabled'
          : '')}>
        <a className="page-link" onClick={() => this.setPage(pager.currentPage + 1)}>Next</a>
      </li>
      <li className={"page-item " + (
        pager.currentPage === pager.totalPages
          ? 'disabled'
          : '')}>
        <a className="page-link" onClick={() => this.setPage(pager.totalPages)}>Last</a>
      </li>
    </ul>);
  }
}

Pagination.defaultProps = defaultProps;
export default Pagination;
