const Pagination = ({ items, pageSize, onPageChange }) => {
  if (items.length <= 1) return null;

  const pageCount = Math.ceil(items.length / pageSize);
  const pages = range(1, pageCount);
  
  const list = pages.map(page => (
    <li key={page} className="page-item">
      <button className="page-link" onClick={() => onPageChange(page)}>
        {page}
      </button>
    </li>
  ));

  return (
    <nav>
      <ul className="pagination">{list}</ul>
    </nav>
  );
};

const range = (start, end) => {
  return Array(end - start + 1)
    .fill(0)
    .map((item, i) => start + i);
};

function paginate(items, pageNumber, pageSize) {
  const start = (pageNumber - 1) * pageSize;
  let page = items.slice(start, start + pageSize);
  return page;
}

const useDataApi = (initialUrl, initialData) => {
  const { useState, useEffect, useReducer } = React;
  const [url, setUrl] = useState(initialUrl);

  const [state, dispatch] = useReducer(dataFetchReducer, {
    isLoading: false,
    isError: false,
    data: initialData,
  });

  useEffect(() => {
    let didCancel = false;

    const fetchData = async () => {
      dispatch({ type: 'FETCH_INIT' });

      try {
        const result = await axios(url);

        if (!didCancel) {
          dispatch({ type: 'FETCH_SUCCESS', payload: result.data });
        }
      } catch (error) {
        if (!didCancel) {
          dispatch({ type: 'FETCH_FAILURE' });
        }
      }
    };

    fetchData();

    return () => {
      didCancel = true;
    };
  }, [url]);

  return [state, setUrl];
};

const dataFetchReducer = (state, action) => {
  switch (action.type) {
    case 'FETCH_INIT':
      return {
        ...state,
        isLoading: true,
        isError: false,
      };
    case 'FETCH_SUCCESS':
      return {
        ...state,
        isLoading: false,
        isError: false,
        data: action.payload,
      };
    case 'FETCH_FAILURE':
      return {
        ...state,
        isLoading: false,
        isError: true,
      };
    default:
      throw new Error();
  }
};

// App that gets data from Hacker News url
function App() {
  const { Fragment, useState, useEffect, useReducer } = React;
  const [query, setQuery] = useState('MIT');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;
  const [{ data, isLoading, isError }, doFetch] = useDataApi(
    'https://hn.algolia.com/api/v1/search?query=MIT',
    {
      hits: [],
    }
  );
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };
  let page = data.hits;
  if (page.length >= 1) {
    page = paginate(page, currentPage, pageSize);
  }
  return (
    <Fragment>
      {isLoading ? (
        <div>Loading ...</div>
      ) : (
        <Fragment>
          <ul className="list-group">
            {page.map((item) => (
              <li key={item.objectID} className="list-group-item">
                <a href={item.url}>{item.title}</a>
              </li>
            ))}
          </ul>
          <Pagination
            items={data.hits}
            pageSize={pageSize}
            onPageChange={handlePageChange}
          />
        </Fragment>
      )}
    </Fragment>
  );
}

// ========================================
ReactDOM.render(<App />, document.getElementById('root'));
