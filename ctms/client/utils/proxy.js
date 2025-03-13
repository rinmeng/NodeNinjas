const hostname = window.location.hostname;
const proxy = hostname === 'localhost'
    ? 'http://localhost:15000'
    : `http://${hostname}:15000`;

export default proxy;