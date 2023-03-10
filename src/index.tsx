import ReactDOM from 'react-dom/client';
import App from "./app";

window.oncontextmenu = function () {
    return false;
}

const root = ReactDOM.createRoot(
    document.getElementById('app')
);
root.render(<App />);
